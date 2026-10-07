import { chromium } from 'playwright-core';
import fs from 'node:fs';
import readline from 'node:readline/promises';

const argv = process.argv.slice(2);
const FULL = argv.includes('--full');
const WISHLIST_ONLY = argv.includes('--wishlist-only');
const BOTH = argv.includes('--both');
if (WISHLIST_ONLY && BOTH) {
  throw new Error('--wishlist-only and --both are mutually exclusive');
}

// no list flag -> beers only; --both adds wishlist; --wishlist-only replaces it
const LISTS = WISHLIST_ONLY
  ? ['wishlist']
  : BOTH
    ? ['beers', 'wishlist']
    : (process.env.LISTS ?? 'beers').split(',');

// beers pages sort newest-first; a run of already-known bids marks where
// previously harvested data begins, letting incremental runs stop early.
const KNOWN_STREAK = 5;
const PROFILE_DIR = new URL('./chrome-profile', import.meta.url).pathname;
const BASE = 'https://untappd.com';

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  channel: 'chrome',
  headless: false,
  viewport: { width: 1366, height: 900 },
  args: ['--disable-blink-features=AutomationControlled'],
});

const page = ctx.pages()[0] ?? (await ctx.newPage());

const detectUsernameOnPage = () =>
  page.evaluate(() => {
    const usernameEl = document.querySelector('.user_mini .info .username');
    const username = usernameEl?.textContent?.trim() ?? '';
    if (/^[A-Za-z0-9_.-]+$/.test(username)) return username;

    const profileLink = document.querySelector('a[data-href=":user/profile"]');
    const profileMatch = (profileLink?.getAttribute('href') ?? '').match(
      /^\/user\/([A-Za-z0-9_.-]+)\/?$/
    );
    if (profileMatch) return profileMatch[1];

    const headerLinks = document.querySelectorAll(
      'header a[href^="/user/"], #header a[href^="/user/"], nav a[href^="/user/"]'
    );
    for (const link of headerLinks) {
      const match = (link.getAttribute('href') ?? '').match(/^\/user\/([A-Za-z0-9_.-]+)\/?$/);
      if (match && !['logout', 'login', 'signin'].includes(match[1].toLowerCase())) {
        return match[1];
      }
    }
    return null;
  });

async function resolveUsername() {
  console.log('[user] detecting username from your logged-in Untappd profile');
  console.log('[user] >>> A CHROME WINDOW IS OPEN — LOG IN AND SOLVE ANY CAPTCHA THERE <<<');
  await page.goto(BASE + '/home', { waitUntil: 'domcontentloaded' });

  const deadline = Date.now() + 15 * 60 * 1000;
  let lastNav = 0;
  let announced = false;
  while (Date.now() < deadline) {
    let name = null;
    try {
      name = await detectUsernameOnPage();
    } catch {
      // page navigated mid-eval; retry next tick
    }
    if (name) {
      console.log(`[user] logged in as ${name}`);
      return name;
    }
    const url = page.url();
    const userIsTyping = /\/login|\/auth|\/sign/.test(url) || !url.includes('untappd.com');
    if (userIsTyping && !announced) {
      console.log('[user] waiting for you to log in — take your time, the window will NOT refresh');
      announced = true;
    }
    if (!userIsTyping && Date.now() - lastNav > 10000) {
      lastNav = Date.now();
      await page.goto(BASE + '/home', { waitUntil: 'domcontentloaded' }).catch(() => {});
    }
    await page.waitForTimeout(1500);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question('[user] could not detect your username — enter it: ')).trim();
  rl.close();
  if (!answer) throw new Error('no username given; set UNTAPPD_USER to skip detection');
  return answer;
}

const USER = process.env.UNTAPPD_USER ?? (await resolveUsername());

// beer history uses .beer-item cards; the wishlist page uses a differently
// shaped .list-container > .list-item markup with no "Show More" pagination.
const ITEM_SELECTOR = { beers: '.beer-item', wishlist: '.list-container .list-item' };

const extractBeers = () =>
  page.$$eval('.beer-item', (els) =>
    els.map((el) => {
      const blocks = [...el.querySelectorAll('.ratings .you')];
      const yours = blocks.find((b) => b.querySelector('p')?.textContent.startsWith('You Rating'));
      const global = blocks.find((b) => b.querySelector('p')?.textContent.startsWith('Global Rating'));
      return {
        bid: el.dataset.bid,
        name: el.querySelector('.beer-details .name')?.textContent.trim() ?? null,
        brewery: el.querySelector('.beer-details .brewery')?.textContent.trim() ?? null,
        style: el.querySelector('.beer-details .style')?.textContent.trim() ?? null,
        yourRating: yours ? parseFloat(yours.querySelector('.caps').dataset.rating) : null,
        globalRating: global ? parseFloat(global.querySelector('.caps').dataset.rating) : null,
        abv: parseFloat(el.querySelector('.details .abv')?.textContent) || null,
        totalCheckins: parseInt(el.querySelector('.check-ins')?.textContent.replace(/\D/g, '')) || 1,
        firstCheckinId:
          parseInt(el.querySelector('.details .date a')?.href.match(/checkin\/(\d+)/)?.[1]) || null,
        url: el.querySelector('.beer-details .name a')?.getAttribute('href') ?? null
      };
    })
  );

const extractWishlist = () =>
  page.$$eval('.list-container .list-item', (els) =>
    els.map((el) => {
      const nameLink = el.querySelector('.item-info h2 a');
      const breweryLink = el.querySelector('.item-info h3 a');
      const bidMatch = el.className.match(/beer-0-(\d+)/);
      const styleAbv = el.querySelector('.item-info h4')?.textContent ?? '';
      const abvMatch = styleAbv.match(/([\d.]+)%\s*ABV/);
      const ratingEl = el.querySelector('.rating-container .caps');
      return {
        bid: bidMatch ? bidMatch[1] : el.querySelector('.remove-from-list')?.dataset.itemId ?? null,
        name: nameLink?.textContent.trim() ?? null,
        brewery: breweryLink?.textContent.trim() ?? null,
        style: styleAbv.split('\u2022')[0]?.trim() || null,
        globalRating: ratingEl ? parseFloat(ratingEl.dataset.rating) : null,
        abv: abvMatch ? parseFloat(abvMatch[1]) : null,
        dateAdded: el.querySelector('.date-added abbr')?.dataset.date ?? null,
        url: nameLink?.getAttribute('href') ?? null
      };
    })
  );

function findKnownStreakBoundary(items, knownBidSet, streak = KNOWN_STREAK) {
  let run = 0;
  for (let i = 0; i < items.length; i++) {
    if (knownBidSet.has(items[i].bid)) {
      run++;
      if (run >= streak) return i - streak + 1;
    } else {
      run = 0;
    }
  }
  return -1;
}

async function harvest(kind, { full }) {
  const out = `untappd-${kind}.json`;
  const fileExists = fs.existsSync(out);

  // wishlist has no pagination to resume from, so it's a plain skip/replace.
  if (kind === 'wishlist' && fileExists && !full) {
    console.log(`[skip] ${out} already exists (use --full to re-harvest)`);
    return;
  }

  let existing = null;
  let knownBidSet = null;
  if (kind === 'beers' && fileExists && !full) {
    existing = JSON.parse(fs.readFileSync(out, 'utf8'));
    knownBidSet = new Set(existing.map((b) => b.bid));
    console.log(
      `[beers] found existing file with ${existing.length} items; incremental mode (use --full to override)`
    );
  }

  const itemSelector = ITEM_SELECTOR[kind] ?? '.beer-item';
  const path = `/user/${USER}/${kind}`;
  console.log(`[${kind}] opening ${BASE}${path}`);
  console.log(`[${kind}] >>> A CHROME WINDOW IS OPEN — LOG IN AND SOLVE ANY CAPTCHA THERE <<<`);
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });

  // Poll until the list renders. NEVER navigate while the user is on a login
  // page, and re-navigate at most once per 10s (so no refresh-every-second).
  const deadline = Date.now() + 15 * 60 * 1000;
  let lastNav = 0;
  let announced = false;
  while ((await page.locator(itemSelector).count()) === 0) {
    if (Date.now() > deadline) throw new Error(`[${kind}] timed out waiting for beer list`);
    const url = page.url();
    const userIsTyping = /\/login|\/auth|\/sign/.test(url) || !url.includes('untappd.com');
    if (userIsTyping && !announced) {
      console.log(`[${kind}] waiting for you to log in — take your time, the window will NOT refresh`);
      announced = true;
    }
    if (!url.includes(path) && !userIsTyping && Date.now() - lastNav > 10000) {
      lastNav = Date.now();
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded' }).catch(() => {});
    }
    await page.waitForTimeout(1500);
  }

  // Click "Show More" until exhausted, max ~1 request/sec. The wishlist page
  // has no such button (fully server-rendered), so this loop no-ops for it.
  // In incremental mode, stop as soon as a run of already-known beers shows
  // up (they sort newest-first, so that marks previously harvested data).
  let stall = 0;
  let reachedKnown = knownBidSet && findKnownStreakBoundary(await extractBeers(), knownBidSet) !== -1;
  if (reachedKnown) console.log(`[${kind}] already-loaded page overlaps previously scraped beers`);
  while (!reachedKnown) {
    const btn = page
      .locator('a:has-text("Show More"), button:has-text("Show More"), a:has-text("show more"), button:has-text("show more")')
      .first();
    if (!(await btn.isVisible().catch(() => false))) break;
    const before = await page.locator(itemSelector).count();
    await btn.click();
    for (let i = 0; i < 15 && (await page.locator(itemSelector).count()) === before; i++) {
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(1000);
    const now = await page.locator(itemSelector).count();
    if (now === before) {
      stall++;
      console.log(`[${kind}] no growth (attempt ${stall}/3), ${now} items`);
      if (stall >= 3) {
        console.log(`[${kind}] giving up on further pages`);
        break;
      }
    } else {
      stall = 0;
      if (now % 50 < 10) console.log(`[${kind}] ${now} items loaded`);
      if (knownBidSet) {
        const boundary = findKnownStreakBoundary(await extractBeers(), knownBidSet);
        if (boundary !== -1) {
          reachedKnown = true;
          console.log(`[${kind}] reached previously scraped beers after ${boundary} new items — stopping early`);
        }
      }
    }
  }

  let items = await (kind === 'wishlist' ? extractWishlist() : extractBeers());

  if (knownBidSet) {
    const boundary = findKnownStreakBoundary(items, knownBidSet);
    const newItems = boundary === -1 ? items : items.slice(0, boundary);
    const merged = new Map();
    for (const it of newItems) merged.set(it.bid, it);
    for (const it of existing) if (!merged.has(it.bid)) merged.set(it.bid, it);
    items = [...merged.values()];
    console.log(
      `[${kind}] incremental: ${newItems.length} new, ${items.length - newItems.length} carried over -> ${items.length} total`
    );
  }

  fs.writeFileSync(out, JSON.stringify(items, null, 2));
  console.log(`[${kind}] DONE: ${items.length} items -> ${out}`);
}

for (const kind of LISTS) {
  try {
    await harvest(kind, { full: FULL });
  } catch (err) {
    console.error(`[${kind}] failed: ${err.message}`);
  }
}

await ctx.close();
console.log('ALL DONE');
