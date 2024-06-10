<script lang="ts">
	import FilterIcon from 'virtual:icons/mingcute/filter-2-line';
	import InternalFilters from './internal/Filters.svelte';
	import type { Filters } from '../../../types/filters';
	import { beforeNavigate } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import { ProductCategory } from '../../../types/product';
	import { DEFAULT_ABV_RANGE, DEFAULT_PRICE_RANGE } from '../../../constants';

	export let filters: Filters;

	let filterDialog: HTMLDialogElement | undefined;

	const dispatch = createEventDispatcher<{ filter: Filters }>();

	function updateFilters(updatedFilters: Filters) {
		dispatch('filter', updatedFilters);
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
		const resetFilter = Object.assign({}, filters);
		resetFilter.price = resetFilter.abv ? DEFAULT_PRICE_RANGE : undefined;
		resetFilter.abv = resetFilter.abv ? DEFAULT_ABV_RANGE : undefined;
		resetFilter.productCategories.forEach((productCategory) => {
			productCategory.name === ProductCategory.ØL
				? (productCategory.checked = true)
				: (productCategory.checked = false);
			productCategory.subCategories.forEach((subCategory) => (subCategory.checked = false));
		});
		dispatch('filter', resetFilter);
	}

	beforeNavigate(({ to }) => {
		if (to?.route.id !== '/topp-rangert') closeFilterDialog();
	});
</script>

<div class="row-start-2 col-span-4 pr-6">
	<div
		class="lg:block hidden xl:pr-16 xl:mr-16 max-h-[calc(100vh-136px)] sticky top-[136px] pb-4 overflow-y-auto overflow-x-hidden"
	>
		<InternalFilters {filters} onChange={updateFilters} on:reset={resetFilters} />
	</div>
	<div class="lg:hidden block">
		<dialog
			bind:this={filterDialog}
			class="w-screen max-w-[100vw] h-screen max-h-screen m-0 top-0 overflow-auto overscroll-contain z-40 pb-20 px-4 pt-4"
		>
			<InternalFilters
				{filters}
				onChange={updateFilters}
				on:closeDialog={closeFilterDialog}
				on:reset={resetFilters}
			/>
		</dialog>
		<button
			on:click={openFilterDialog}
			class="lg:hidden fixed p-4 rounded-full bg-wmp bottom-4 right-4 text-white z-30"
		>
			<FilterIcon class="w-8 h-8" />
		</button>
	</div>
</div>
