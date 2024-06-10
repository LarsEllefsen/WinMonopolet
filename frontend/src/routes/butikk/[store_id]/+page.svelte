<script lang="ts">
	import { page } from '$app/stores';
	import ProductFilters from '$lib/components/productFilters/ProductFilters.svelte';
	import { createFiltersFromStock } from '$lib/utils/createFilters';
	import { filterStock } from '$lib/utils/filterProducts';
	import StockList from '$lib/components/stockList/StockList.svelte';
	import type { Store } from '../../../types/store';

	let numProductsToShow = 20;

	$: currentStore = $page.data.stores.find(
		(store: Store) => store.store_id === $page.params.store_id
	) as Store;
	$: filters = createFiltersFromStock($page.data.stock ?? []);
	$: stock = filterStock($page.data.stock ?? [], filters).slice(0, 20);
</script>

<div class="container mx-auto relative">
	<div class="grid grid-cols-12 lg:px-0 px-4">
		<div class="lg:col-span-6 lg:col-start-5 col-span-full pb-4 bg-white">
			<h1 class="text-4xl font-thin text-center bg-white">{currentStore.name}</h1>
		</div>
		<ProductFilters bind:filters on:filter={async (event) => (filters = event.detail)} />
		<div class="lg:col-span-6 md:col-span-10 md:col-start-2 col-span-full">
			<StockList {stock} bind:numProductsToShow maxLength={stock.length} />
		</div>
	</div>
</div>
