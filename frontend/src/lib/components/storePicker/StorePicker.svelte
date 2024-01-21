<script lang="ts">
	import type { Store } from '../../../types/store';
	import LocationIcon from '~icons/mdi/crosshairs-gps';
	import InfiniteScroll from '../infiniteScroll/InfiniteScroll.svelte';
	import StoreCard from './StoreCard.svelte';
	import { fly } from 'svelte/transition';
	import { searchStores } from '$lib/utils/searchStores';
	import { sortStoresByRelevancy } from '$lib/utils/sortStoresByRelevancy';
	import SearchInput from '../searchInput/SearchInput.svelte';
	import { page } from '$app/stores';

	export let stores: Store[];

	let isLoggedIn = $page.data.isAuthenticated;

	let numStoresToShow = 20;
	let searchInput = '';
	let geolocationPosition: GeolocationCoordinates | undefined = undefined;

	const getRandomStore = () => {
		return stores[Math.floor(Math.random() * stores.length)];
	};

	const getGeoLocationPosition = () => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					geolocationPosition = position.coords;
					console.log({ geolocationPosition });
				},
				(error) => {
					console.error(error.message);
				}
			);
		} else {
			console.error('Geolocation is not available');
		}
	};

	$: getStoresToShow = (): Store[] => {
		const filteredStores = searchStores(searchInput, stores);
		return sortStoresByRelevancy(searchInput, filteredStores, geolocationPosition).slice(
			0,
			numStoresToShow
		);
	};
</script>

<div class="">
	<h2 class="text-3xl mb-4">Finn butikk</h2>

	<p class="mb-8 font-light">
		{isLoggedIn
			? 'Du kan markere en butikk som favoritt ved å trykke på stjerneikonet nedenfor. Da kan du enkelt finne den frem igjen nestegang ved å trykke på stjerneikonet øverst på siden når du er logget inn.'
			: 'Ved å logge inn kan du markere butikker som favoritter, slik at de blir enda enklere å finne frem til neste gang.'}
	</p>
	<div class="flex flex-row items-end gap-x-4 pb-4 pr-4">
		<div class="md:w-64 w-full">
			<SearchInput
				class="w-full"
				id={'storepicker-search-stores'}
				label={'Søk etter butikk'}
				placeholder={`F.eks ${getRandomStore().name}`}
				bind:value={searchInput}
			/>
		</div>
		<button
			class="flex items-center justify-center h-11 w-11 p-2 border rounded-md border-black group hover:bg-ida-blue focus-visible:ring-4"
			on:click={getGeoLocationPosition}><LocationIcon class="group-hover:text-black" /></button
		>
	</div>
	<ul class="max-h-[600px] overflow-y-scroll overflow-x-hidden">
		{#each getStoresToShow() as store, index}
			<div
				out:fly={{ delay: index, duration: 250, x: '-50' }}
				in:fly|global={{ delay: index * 50, duration: 250, x: '50' }}
			>
				<StoreCard {store} />
			</div>
		{/each}
		<InfiniteScroll incrementBy={10} bind:limiter={numStoresToShow} maxLength={stores.length} />
	</ul>
</div>
