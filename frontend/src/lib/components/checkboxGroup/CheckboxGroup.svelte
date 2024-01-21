<script lang="ts">
	import type { ProductCategoryFilter } from '../productFilters/ProductFilters.svelte';
	import Chevron from 'virtual:icons/mdi/chevron-down';
	import Checkbox from '../checkbox/Checkbox.svelte';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { createEventDispatcher } from 'svelte';

	export let parent: ProductCategoryFilter;
	export let children: ProductCategoryFilter[] | undefined;

	const dispatch = createEventDispatcher();

	let expanded = false;

	const toggleChildren = (checkboxEvent: Event) => {
		const checkboxElement = checkboxEvent.target as HTMLInputElement;
		children = children?.map((child) => ({ ...child, ...{ checked: checkboxElement.checked } }));
	};

	const onStyleChange = (checkboxEvent: Event) => {
		const checkboxElement = checkboxEvent.target as HTMLInputElement;
		if (!parent.checked && checkboxElement.checked) {
			parent.checked = true;
			return;
		}

		if (parent.checked && children?.every((child) => !child.checked)) {
			parent.checked = false;
		}
	};
</script>

<div class="relative">
	<div class="flex flex-row">
		<Checkbox
			id={`${parent.name}-checkbox`}
			label={parent.name}
			bind:checked={parent.checked}
			on:change={(checkboxEvent) => {
				toggleChildren(checkboxEvent);
				dispatch('change');
			}}
		/>
		<button class="grow flex justify-end" on:click={() => (expanded = !expanded)}>
			<div class={`transition ${expanded ? 'rotate-180' : 'rotate-0'}`}>
				<Chevron style={'width:24px;height:24px;'} />
			</div>
		</button>
	</div>
	{#if expanded}
		{#if children && children.length}
			<div
				transition:slide|global={{ easing: cubicOut }}
				class="pl-6 bar my-4 flex flex-col gap-y-2"
			>
				{#each children as child}
					<Checkbox
						id={`${child.name}-checkbox`}
						label={child.name}
						bind:checked={child.checked}
						on:change={(checkboxEvent) => {
							onStyleChange(checkboxEvent);
							dispatch('change');
						}}
					/>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.bar {
		background: linear-gradient(to right, rgba(62, 76, 223, 1) 0.25rem, transparent 0.25rem);
		background-position-x: 16%;
	}
</style>
