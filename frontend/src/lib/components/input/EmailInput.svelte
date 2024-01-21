<script lang="ts">
	import InputBase from './InputBase.svelte';

	export let name: string = '';
	export let id: string;
	export let value: string = '';
	export let label: string | null = null;
	export let placeholder: string = '';
	export let alwaysShowOutline = true;
	export let errorMessage: string | null = null;

	const handleInput = (event: Event) => {
		value = (event.target as HTMLInputElement).value;
	};
</script>

<InputBase
	{name}
	{value}
	{alwaysShowOutline}
	{errorMessage}
	{label}
	{id}
	{placeholder}
	type="email"
	on:input={handleInput}
/>
