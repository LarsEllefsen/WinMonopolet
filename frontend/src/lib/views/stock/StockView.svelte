<script lang="ts">
	import { page } from '$app/stores';
	import ProductFilters from '$lib/components/productFilters/ProductFilters.svelte';
	import { filterProducts } from '$lib/components/productFilters/filterProducts';
	import { createFilters } from '$lib/components/productFilters/createFilters';
	import StockList from '$lib/components/stockList/StockList.svelte';
	import type { Filters } from '../../../types/filters';
	import { beforeNavigate } from '$app/navigation';
	import FilterIcon from 'virtual:icons/mingcute/filter-2-line';
	import type { Stock } from '../../../types/stock';

	export let stock: Stock[];
	export let title: string;

	let filterDialog: HTMLDialogElement | undefined;

	let numProductsToShow = 20;

	const cachedFilters = createFilters(stock);

	function updateFilters(updatedFilters: Filters) {
		filters = { ...updatedFilters };
	}

	function openFilterDialog() {
		if (filterDialog) {
			document.body.style.overflow = 'hidden';
			filterDialog.showModal();
		}
	}

	function closeFilterDialog() {
		document.body.style.overflow = 'auto';
		if (filterDialog) {
			filterDialog.close();
		}
	}

	function resetFilters() {
		filters = cachedFilters;
	}

	beforeNavigate(() => {
		closeFilterDialog();
	});

	$: filters = createFilters(stock);
	$: stockToShow = filterProducts(stock, filters).slice(0, numProductsToShow);
</script>

<div class="container mx-auto relative">
	<div class="grid grid-cols-12 lg:px-0 px-4">
		<div class="lg:col-span-6 lg:col-start-5 col-span-full pb-4 bg-white">
			<h1 class="text-4xl font-thin text-center bg-white">
				{title}
			</h1>
		</div>
		<div class="row-start-2 col-span-4 pr-6">
			<div
				class="lg:block hidden xl:pr-16 xl:mr-16 max-h-[calc(100vh-136px)] sticky top-[136px] pb-4 overflow-y-auto overflow-x-hidden"
			>
				<ProductFilters {filters} onChange={updateFilters} on:reset={resetFilters} />
			</div>
			<div class="lg:hidden block">
				<dialog
					bind:this={filterDialog}
					class="w-screen max-w-[100vw] h-screen max-h-screen m-0 top-0 overflow-auto overscroll-contain z-40 pb-20 px-4 pt-4"
				>
					<ProductFilters {filters} onChange={updateFilters} on:closeDialog={closeFilterDialog} />
				</dialog>
				<button
					on:click={openFilterDialog}
					class="lg:hidden fixed p-4 rounded-full bg-wmp bottom-4 right-4 text-white z-30"
				>
					<FilterIcon class="w-8 h-8" />
				</button>
			</div>
		</div>
		<div class="lg:col-span-6 md:col-span-10 md:col-start-2 col-span-full">
			<StockList stock={stockToShow} bind:numProductsToShow maxLength={stock.length} />
		</div>
	</div>
</div>
