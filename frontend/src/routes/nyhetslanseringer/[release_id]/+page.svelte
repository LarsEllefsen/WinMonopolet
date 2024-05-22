<script lang="ts">
	import { page } from '$app/stores';
	import { getReadableDateFormat } from '$lib/utils/getReadableDateFormat';
	import StockView from '$lib/views/stock/StockView.svelte';
	import type { UpcomingProduct } from '../../../types/product';
	import type { Stock } from '../../../types/stock';

	const products: UpcomingProduct[] = $page.data.products;
	const stock = products.map((x) => ({
		stock_level: 0,
		product: x.vinmonopoletProduct,
		last_updated: ''
	})) satisfies Stock[];
	const title = `Nyhetslansering ${getReadableDateFormat(new Date(products[0].releaseDate))}`;
</script>

<StockView {stock} {title} />
