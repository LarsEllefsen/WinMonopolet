<script lang="ts">
	import type { HTMLInputTypeAttribute } from 'svelte/elements';

	export let name: string = '';
	export let id: string;
	export let value: string = '';
	export let label: string | null = null;
	export let placeholder: string = '';
	export let alwaysShowOutline = true;
	export let errorMessage: string | null = null;
	export let type: HTMLInputTypeAttribute = 'text';

	$: hasError = errorMessage !== null && errorMessage !== '';

	$: getClasses = () => {
		let classes = [
			'w-full',
			'peer',
			'border',
			'p-2',
			'inline-flex',
			'flex-col',
			'relative',
			'transition-all',
			'outline',
			'outline-transparent',
			'outline-2',
			'focus-within:outline-ida-blue',
			'focus-within:shadow-box',
			'focus-within:shadow-ida-blue'
		];
		if (hasError) {
			classes.push('border-red-400', 'text-red-400');
		} else {
			classes.push('border-black');
		}

		if (alwaysShowOutline) {
			classes.push('rounded-md', 'focus-within:border-ida-blue');
		} else {
			classes.push(
				'border-t-transparent',
				'border-x-transparent',
				'outline',
				'-outline-offset-1',
				'outline-transparent',
				'focus-within:rounded-md'
			);
		}

		return classes.join(' ');
	};
</script>

<div class="group">
	{#if label}
		<label for={id} class="block mb-2 font-light group-focus-within:font-semibold cursor-pointer"
			>{label}</label
		>
	{/if}
	<div class={`${getClasses()}`}>
		<input
			{name}
			{id}
			class="focus:outline-none"
			{placeholder}
			bind:value
			on:change
			on:input
			on:focus
		/>
	</div>
	{#if hasError}
		<span class="text-red-400 font-semibold">{errorMessage}</span>
	{/if}
</div>
