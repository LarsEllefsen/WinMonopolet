<script lang="ts">
	import { page } from '$app/stores';
	import ProductFilters from '$lib/components/productFilters/ProductFilters.svelte';
	import { createFiltersFromStock } from '$lib/utils/createFilters';
	import { filterStock } from '$lib/utils/filterProducts';
	import StockList from '$lib/components/stockList/StockList.svelte';

	let numProductsToShow = 20;

	$: filters = createFiltersFromStock($page.data.stock ?? []);
	$: products = filterStock($page.data.stock ?? [], filters);
</script>

<div class="container mx-auto relative">
	<div class="grid grid-cols-12 lg:px-0 px-4">
		<div class="lg:col-span-6 lg:col-start-5 col-span-full pb-4 bg-white">
			<h1 class="text-4xl font-thin text-center bg-white">{$page.data.title}</h1>
		</div>
		<ProductFilters bind:filters on:filter={async (event) => (filters = event.detail)} />
		<div class="lg:col-span-6 md:col-span-10 md:col-start-2 col-span-full">
			<StockList stock={products} bind:numProductsToShow maxLength={products.length} />
		</div>
	</div>
</div>
