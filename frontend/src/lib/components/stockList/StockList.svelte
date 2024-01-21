<script lang="ts">
	import type { Stock } from '../../../types/stock';
	import InfiniteScroll from '../infiniteScroll/InfiniteScroll.svelte';
	import ErrorReportDialog from './ErrorReportDialog.svelte';
	import ProductCard from './ProductCard.svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';

	export let stock: Stock[];
	export let numProductsToShow: number;
	export let maxLength: number;

	let errorReportDialog: ErrorReportDialog | undefined;

	const showErrorReportDialog = (stockEntry: Stock) => {
		errorReportDialog?.showReportDialog(stockEntry.product);
	};
</script>

<ErrorReportDialog bind:this={errorReportDialog} />
<ul class="lg:pt-8 pt-4">
	{#if stock.length != 0}
		{#each stock as stockEntry, index (stockEntry.product.vmp_id)}
			<li class="mb-11" animate:flip={{ delay: 0, duration: 600, easing: quintOut }}>
				<ProductCard
					stock={stockEntry}
					{index}
					on:reportError={() => showErrorReportDialog(stockEntry)}
				/>
			</li>
		{/each}
	{:else}
		<h2 class="text-xl font-light text-center">Fant ingen produkter matchende søket ditt</h2>
	{/if}
</ul>
<InfiniteScroll bind:limiter={numProductsToShow} incrementBy={20} {maxLength} usePageScroll />
