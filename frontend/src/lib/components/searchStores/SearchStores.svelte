<script lang="ts">
	import { page } from '$app/stores';
	import SearchIcon from '~icons/mdi-light/magnify';
	import Cancel from 'virtual:icons/mdi/remove';
	import { searchStores } from '$lib/utils/searchStores';
	import { sortStoresByRelevancy } from '$lib/utils/sortStoresByRelevancy';
	import SearchInput from '../searchInput/SearchInput.svelte';
	import { fade, slide } from 'svelte/transition';

	export let searchIsActive = false;

	let searchInputElement: HTMLInputElement | undefined;

	let searchInput = '';

	const onSearch = (searchInput: string) => {
		const stores = searchStores(searchInput, $page.data.stores);
		return sortStoresByRelevancy(searchInput, stores, null).slice(0, 5);
	};

	$: searchResult = onSearch(searchInput);
	$: {
		if (searchIsActive && searchInputElement) {
			searchInputElement.focus();
		}
	}
</script>

<div class="md:block md:relative hidden">
	<SearchInput
		id={'header-search-stores'}
		bind:value={searchInput}
		placeholder="Søk etter butikk"
		alwaysShowOutline={false}
		on:focus
	/>

	{#if searchInput && searchIsActive}
		<ul class="absolute top-12 left-0 border border-black rounded-md w-48 max-w-48 overflow-hidden">
			{#each searchResult as store}
				<li>
					<a
						class="block background-color-slide p-4"
						on:click={() => (searchInput = '')}
						href={`/butikk/${store.store_id}`}>{store.name}</a
					>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<div class="md:hidden block">
	<button on:click|stopPropagation class="flex items-center justify-center w-8 h-8">
		<svelte:component this={searchIsActive ? Cancel : SearchIcon} class="w-full h-full" />
	</button>
	{#if searchIsActive}
		<div
			transition:slide|global
			class="absolute border-b border-black top-16 left-0 w-screen pt-4 bg-white z-50"
		>
			<SearchInput
				bind:inputElement={searchInputElement}
				class="w-full px-4"
				id={'header-search-stores'}
				bind:value={searchInput}
				placeholder="Søk etter butikk"
				alwaysShowOutline={searchInput ? true : false}
			/>
			{#if searchInput}
				<ul class="">
					{#each searchResult as store}
						<li>
							<a
								class="block background-color-slide p-4"
								on:click={() => (searchInput = '')}
								href={`/butikk/${store.store_id}`}>{store.name}</a
							>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<div
			transition:fade
			class="absolute w-full h-dvh bg-black opacity-40 left-0 top-[80px] pointer-events-none"
		/>
	{/if}
</div>
