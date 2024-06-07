<script lang="ts">
	import StockView from '$lib/views/stock/StockView.svelte';
	import type { Stock } from '../../types/stock';
	import type { VinmonopoletProduct } from '../../types/product';
	import { page } from '$app/stores';
	import type { Filters } from '../../types/filters';

	const products: VinmonopoletProduct[] = $page.data.products;
	const stock = products.map((product) => ({
		stock_level: 0,
		product: product,
		last_updated: ''
	})) satisfies Stock[];
	const title = '';

	const createSearchParams = (filters: Filters | null): URLSearchParams | null => {
		if (filters === null) return null;
		const params = new URLSearchParams();

		const productCategories = filters.productCategories.filter((category) => category.checked);
		productCategories.forEach((category) => params.append('productCategory', category.name));

		const productSubCategories = productCategories.flatMap(({ subCategories }) =>
			subCategories.filter(({ checked }) => checked)
		);
		productSubCategories.forEach((subCategory) =>
			params.append('productSubCategory', subCategory.name)
		);

		return params;
	};

	$: filters = null satisfies Filters | null;
	$: urlParams = createSearchParams(filters) satisfies URLSearchParams | null;
	$: {
		if (urlParams !== null) {
			window.location.search = urlParams.toString();
		}
	}
</script>

<StockView
	{stock}
	{title}
	on:filtersChanged={(event) => (filters = event.detail)}
	performFiltering={false}
/>
