<script lang="ts">
	import RangeSlider from 'svelte-range-slider-pips';

	export let label: string;
	export let id: string;
	export let suffix: string;
	export let values: number[];
	export let min: number;
	export let max: number;
</script>

<div class="mb-4">
	<label for={id} class="p-2 font-semibold">{label}</label>
	<RangeSlider {id} {max} {min} bind:values float range on:stop />
	<div class="flex justify-between px-2">
		<span>{values[0]}{suffix}</span> <span>{values[1]}{suffix}</span>
	</div>
</div>

<style>
	:root {
		--range-handle-inactive: var(--wmp-primary);
		--range-handle: var(--wmp-primary);
		--range-handle-focus: var(--wmp-primary-dark);
		--range-range-inactive: var(--wmp-primary);
		--range-range: var(--wmp-primary);
		--range-handle-border: var(--wmp-light);
	}
</style>
