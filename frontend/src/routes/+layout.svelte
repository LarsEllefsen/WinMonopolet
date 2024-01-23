<script lang="ts">
	import '../app.css';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import UserContextMenu from '$lib/components/userContextMenu/UserContextMenu.svelte';
	import FavoritedStores from '$lib/components/favoritedStores/FavoritedStores.svelte';
	import Hamburger from '$lib/components/hamburgerMenu/Hamburger.svelte';
	import SearchStores from '$lib/components/searchStores/SearchStores.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { fade, slide } from 'svelte/transition';
	import Link from '$lib/components/link/Link.svelte';
	import { onNavigate } from '$app/navigation';

	type MenuState = {
		userContextMenuOpen: boolean;
		searchIsActive: boolean;
		favoriteStoresOpen: boolean;
		megaMenuOpen: boolean;
	};

	let menuState = {
		userContextMenuOpen: false,
		searchIsActive: false,
		favoriteStoresOpen: false,
		megaMenuOpen: false
	} as MenuState;

	const closeMenu = (menu: keyof MenuState) => {
		menuState[menu] = false;
	};

	const closeAllMenus = () => {
		Object.keys(menuState).forEach((key) => {
			closeMenu(key as keyof MenuState);
		});
	};

	const toggleMenu = (menu: keyof MenuState) => {
		menuState[menu] = !menuState[menu];
		Object.keys(menuState).forEach((key) => {
			if (key !== menu) closeMenu(key as keyof MenuState);
		});
	};

	let navbar: HTMLElement | null = null;

	const detectClickOutside = (event: MouseEvent) => {
		if (navbar && event.target instanceof Node) {
			const clickWasInsideNavbar = navbar.contains(event.target);
			if (!clickWasInsideNavbar) closeAllMenus();
		}
	};

	onNavigate(() => {
		closeAllMenus();
	});

	onMount(() => {
		document.addEventListener('click', detectClickOutside);
	});
</script>

<!-- <Header /> -->
<nav class="sticky top-0 bg-white z-50" id="navbar" bind:this={navbar}>
	<div class="p-4 h-20 flex justify-between container mx-auto">
		<a class="h-full" href="/">
			<img class="h-full" src="/images/header_logo.png" alt="Winmonopolet logo" />
		</a>

		<div class="flex md:gap-x-8 gap-x-6 items-center">
			<div class="">
				<UserContextMenu
					open={menuState.userContextMenuOpen}
					on:click={() => toggleMenu('userContextMenuOpen')}
				/>
			</div>
			{#if $page.data.isAuthenticated}
				<div class="">
					<FavoritedStores
						open={menuState.favoriteStoresOpen}
						on:click={() => toggleMenu('favoriteStoresOpen')}
					/>
				</div>
			{/if}
			<div class="">
				<SearchStores
					searchIsActive={menuState.searchIsActive}
					on:focus={() => toggleMenu('searchIsActive')}
					on:click={() => toggleMenu('searchIsActive')}
				/>
			</div>
			<div>
				<Hamburger open={menuState.megaMenuOpen} on:click={() => toggleMenu('megaMenuOpen')} />
				{#if menuState.megaMenuOpen}
					<div
						class="absolute left-0 top-[80px] max-h-[calc(100dvh-80px)] w-full bg-white border-b border-black z-50 overflow-y-auto"
						transition:slide|global
					>
						<div class="container mx-auto px-4 py-12">
							<div class="grid grid-cols-12 gap-y-4">
								<div class="md:col-span-6 col-span-full flex md:justify-center">
									<ul class="*:mb-8">
										<li>
											<Link href="/nyhetslanseringer">Nyhetslanseringer</Link>
										</li>
										<li><Link href="/topp-rangert">Topp rangert øl uavhengig av butikk</Link></li>
									</ul>
								</div>
								<div class="font-light md:col-span-6 col-span-full flex md:justify-center">
									<ul class="*:mb-8">
										<li><Link href="/om-siden">Om siden</Link></li>
										<li><Link href="/bidra">Bidra</Link></li>
										<li><Link href="/kontakt">Kontakt</Link></li>
									</ul>
								</div>
							</div>
						</div>
					</div>
					<div
						transition:fade
						class="absolute w-full h-dvh bg-black opacity-40 left-0 top-[80px] pointer-events-none"
					/>
				{/if}
			</div>
		</div>
	</div>
</nav>
<slot />
<SvelteToast options={{ intro: { y: 192 }, dismissable: false }} />
