<script lang="ts">
	import { ProductCategory, ProductSubCategory } from '../../types/product';
	import { page } from '$app/stores';
	import type { CreateFilters, Filters } from '../../types/filters';
	import ProductFilters from '$lib/components/productFilters/ProductFilters.svelte';
	import { createFilters } from '$lib/utils/createFilters';
	import { goto } from '$app/navigation';
	import StockList from '$lib/components/stockList/StockList.svelte';

	let numProductsToShow = 20;

	const createSearchParams = (filters: Filters): URLSearchParams => {
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

	const updateSearchParameters = async (filters: Filters) => {
		const URLSearchParams = createSearchParams(filters);
		await goto('?' + URLSearchParams.toString());
	};

	const getFiltersFromSearchParams = (searchParams: URLSearchParams) => {
		const activeProductCategories = searchParams.getAll('productCategory');
		const activeProductSubCategories = searchParams.getAll('productSubCategory');

		const filters = {
			price: undefined,
			abv: undefined,
			onlyShowNewArrivals: undefined,
			removeUserCheckedInProducts: undefined,
			productCategories: [
				{
					name: ProductCategory.ØL,
					checked: activeProductCategories.includes(ProductCategory.ØL),
					subCategories: Object.values(ProductSubCategory).map((category) => ({
						checked: activeProductSubCategories.includes(category),
						name: category,
						styles: []
					}))
				},
				{
					name: ProductCategory.MJØD,
					checked: activeProductCategories.includes(ProductCategory.MJØD),
					subCategories: []
				},
				{
					name: ProductCategory.SIDER,
					checked: activeProductCategories.includes(ProductCategory.SIDER),
					subCategories: []
				}
			]
		};

		return filters satisfies CreateFilters;
	};

	$: products = $page.data.stock ?? [];
	$: filters = createFilters(getFiltersFromSearchParams($page.url.searchParams));
</script>

<div class="container mx-auto relative">
	<div class="grid grid-cols-12 lg:px-0 px-4">
		<div class="lg:col-span-6 lg:col-start-5 col-span-full pb-4 bg-white">
			<h1 class="text-4xl font-thin text-center bg-white">Topp rangert</h1>
		</div>
		<ProductFilters
			bind:filters
			on:filter={async (event) => await updateSearchParameters(event.detail)}
		/>

		<div class="lg:col-span-6 md:col-span-10 md:col-start-2 col-span-full">
			<StockList stock={products} bind:numProductsToShow maxLength={products.length} />
		</div>
	</div>
</div>
