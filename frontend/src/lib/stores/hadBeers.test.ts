import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

vi.mock('$app/environment', () => ({ browser: true }));

const STORAGE_KEY = 'winmonopolet.had-beers';

const createLocalStorageStub = () => {
	const store = new Map<string, string>();
	return {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => void store.set(key, value),
		removeItem: (key: string) => void store.delete(key),
		clear: () => store.clear(),
		key: (index: number) => Array.from(store.keys())[index] ?? null,
		get length() {
			return store.size;
		}
	};
};

let localStorageStub: ReturnType<typeof createLocalStorageStub>;

beforeEach(() => {
	vi.resetModules();
	localStorageStub = createLocalStorageStub();
	Object.defineProperty(globalThis, 'localStorage', {
		value: localStorageStub,
		configurable: true,
		writable: true
	});
});

const loadHadBeersModule = async () => await import('./hadBeers');

const createJsonFile = (data: unknown) =>
	new File([JSON.stringify(data)], 'untappd-beers.json', { type: 'application/json' });

describe('importHadBeersFromFile', () => {
	it('imports a valid payload and returns the count', async () => {
		const { importHadBeersFromFile, hadBeers } = await loadHadBeersModule();

		const count = await importHadBeersFromFile(
			createJsonFile([
				{
					bid: '6725534',
					name: 'Percolate',
					brewery: 'Beak',
					style: 'Stout - Imperial / Double Coffee',
					yourRating: 4.5,
					globalRating: 4.25,
					abv: 10
				},
				{ bid: 123, yourRating: 3 }
			])
		);

		expect(count).toBe(2);
		expect(get(hadBeers).get('6725534')).toBe(4.5);
		expect(get(hadBeers).get('123')).toBe(3);
		expect(get(hadBeers).size).toBe(2);
	});

	it('maps yourRating null and missing ratings to null', async () => {
		const { importHadBeersFromFile, hadBeers } = await loadHadBeersModule();

		await importHadBeersFromFile(
			createJsonFile([
				{ bid: '1', yourRating: null },
				{ bid: '2' }
			])
		);

		expect(get(hadBeers).get('1')).toBeNull();
		expect(get(hadBeers).get('2')).toBeNull();
	});

	it('re-importing replaces the previous import without duplicates', async () => {
		const { importHadBeersFromFile, hadBeers } = await loadHadBeersModule();

		await importHadBeersFromFile(createJsonFile([{ bid: '1' }, { bid: '2' }]));
		await importHadBeersFromFile(createJsonFile([{ bid: '2' }, { bid: '3' }, { bid: '2' }]));

		const imported = get(hadBeers);
		expect(imported.size).toBe(2);
		expect(Array.from(imported.keys())).toEqual(['2', '3']);
	});

	it('throws on non-array JSON', async () => {
		const { importHadBeersFromFile } = await loadHadBeersModule();

		await expect(
			importHadBeersFromFile(createJsonFile({ bid: '1', yourRating: 4 }))
		).rejects.toThrow('Ugyldig fil: forventet en JSON-array med øl.');
	});

	it('throws on invalid JSON', async () => {
		const { importHadBeersFromFile } = await loadHadBeersModule();

		await expect(
			importHadBeersFromFile(new File(['not json {{'], 'untappd-beers.json'))
		).rejects.toThrow('Ugyldig fil: ikke gyldig JSON.');
	});

	it('throws when an item is missing bid', async () => {
		const { importHadBeersFromFile } = await loadHadBeersModule();

		await expect(
			importHadBeersFromFile(createJsonFile([{ bid: '1' }, { name: 'No bid beer' }]))
		).rejects.toThrow('mangler "bid"');
	});

	it('persists a versioned payload to localStorage', async () => {
		const { importHadBeersFromFile } = await loadHadBeersModule();

		await importHadBeersFromFile(
			createJsonFile([
				{ bid: '1', yourRating: 4.5 },
				{ bid: '2', yourRating: null }
			])
		);

		expect(JSON.parse(localStorageStub.getItem(STORAGE_KEY) ?? 'null')).toEqual({
			version: 1,
			beers: [
				{ bid: '1', rating: 4.5 },
				{ bid: '2', rating: null }
			]
		});
	});
});

describe('hadBeers store hydration', () => {
	it('hydrates from localStorage on module init', async () => {
		localStorageStub.setItem(
			STORAGE_KEY,
			JSON.stringify({ version: 1, beers: [{ bid: '42', rating: 3.5 }] })
		);

		const { hadBeers } = await loadHadBeersModule();

		expect(get(hadBeers).get('42')).toBe(3.5);
	});

	it('starts empty when stored payload is garbage', async () => {
		localStorageStub.setItem(STORAGE_KEY, '}not json{');

		const { hadBeers } = await loadHadBeersModule();

		expect(get(hadBeers).size).toBe(0);
	});
});

describe('clearHadBeers', () => {
	it('empties the store and removes the localStorage key', async () => {
		const { importHadBeersFromFile, clearHadBeers, hadBeers } = await loadHadBeersModule();
		await importHadBeersFromFile(createJsonFile([{ bid: '1', yourRating: 4 }]));
		expect(get(hadBeers).size).toBe(1);

		clearHadBeers();

		expect(get(hadBeers).size).toBe(0);
		expect(localStorageStub.getItem(STORAGE_KEY)).toBeNull();
	});
});
