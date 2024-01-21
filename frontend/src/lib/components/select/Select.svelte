<script context="module" lang="ts">
	export type SelectOptions = {
		name: string;
		value: string;
	}[];
</script>

<script lang="ts">
	export let id: string;
	export let value: string;
	export let name: string;
	export let label: string;
	export let options: SelectOptions;
</script>

<div class="flex flex-col">
	<label for={id} class="font-light peer-focus:font-bold mb-2">{label}</label>
	<select
		{name}
		{id}
		bind:value
		on:change
		class="peer p-2 border border-black rounded-md focus:outline-dashed"
	>
		{#each options as option}
			<option value={option.value}>{option.name}</option>
		{/each}
	</select>
</div>
