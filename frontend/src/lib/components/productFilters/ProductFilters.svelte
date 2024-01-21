<script context="module" lang="ts">
	export type ProductCategoryFilter = {
		name: string;
		checked: boolean;
	};

	export type ProductCategoryWithStyles = {
		name: string;
		checked: boolean;
		styles: ProductCategoryFilter[];
	};
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import Slider from '../slider/Slider.svelte';
	import { createEventDispatcher } from 'svelte';
	import CheckboxGroup from '../checkboxGroup/CheckboxGroup.svelte';
	import type { Filters } from '../../../types/filters';
	import Checkbox from '../checkbox/Checkbox.svelte';
	import Collapsible from '../collapsible/Collapsible.svelte';

	export let filters: Filters;
	export let onChange: (asd: Filters) => void;

	const dispatch = createEventDispatcher();

	let isLoggedIn = $page.data.isAuthenticated;
</script>

<div class="lg:max-w-[360px] w-full bg-white relative">
	<Slider
		bind:values={filters.price}
		label="Pris"
		id="price-input"
		suffix=" kr"
		min={0}
		max={1000}
		on:stop={() => onChange(filters)}
	/>
	<Slider
		bind:values={filters.abv}
		label="Alkohol"
		id="abv-input"
		suffix="%"
		min={0}
		max={20}
		on:stop={() => onChange(filters)}
	/>

	<div class="px-2 mb-4 flex flex-col gap-y-2">
		<Checkbox
			bind:checked={filters.onlyShowNewArrivals}
			label={'Kun nyheter'}
			id={`new-arrivals-only-checkbox`}
			on:change={() => onChange(filters)}
		/>
		{#if isLoggedIn}
			<Checkbox
				bind:checked={filters.removeUserCheckedInProducts}
				label={'Skjul innsjekket'}
				id={`hide-had-products-checkbox`}
				on:change={() => onChange(filters)}
			/>
		{/if}
	</div>

	<div class="px-2 mb-4 flex flex-col gap-y-2">
		<p class="mb-2 font-semibold">Varegruppe</p>
		{#each filters.productCategories as productCategory}
			<Checkbox
				bind:checked={productCategory.checked}
				label={productCategory.name}
				id={`${productCategory.name}-checkbox`}
				on:change={() => onChange(filters)}
			/>
		{/each}
	</div>

	<div class="px-2 mb-8">
		{#each filters.productCategories as productCategory}
			{#if productCategory.checked}
				<div class="mb-4">
					<Collapsible label={productCategory.name} startOpen={true}>
						<div class="flex flex-col gap-y-2">
							{#each productCategory.subCategories as subCategory}
								<CheckboxGroup
									bind:parent={subCategory}
									bind:children={subCategory.styles}
									on:change={() => {
										onChange(filters);
									}}
								/>
							{/each}
						</div>
					</Collapsible>
				</div>
			{/if}
		{/each}
	</div>

	<div class="lg:block lg:w-full lg:static lg:p-0 flex gap-x-4 fixed p-4 bottom-0 left-0 w-screen">
		<button
			class="w-full bg-white border-2 border-wmp font-semibold hover:bg-wmp-light hover:text-white text-wmp p-4 rounded-full"
			on:click={() => dispatch('reset')}>Tilbakestill</button
		>
		<button
			class="lg:hidden w-full bg-wmp hover:bg-wmp-dark text-white p-4 rounded-full"
			on:click={() => dispatch('closeDialog')}>Vis resultater</button
		>
	</div>
</div>
