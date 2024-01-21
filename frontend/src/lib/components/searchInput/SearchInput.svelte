<script lang="ts">
	import SearchIcon from '~icons/mdi-light/magnify';

	export let id: string;
	export let value: string = '';
	export let label: string | null = null;
	export let placeholder: string = '';
	export let alwaysShowOutline = true;
	export let inputElement: HTMLInputElement | undefined = undefined;
	let clazz: string = '';
	export { clazz as class };

	const getClasses = () => {
		let classes = [
			'border',
			'border-black',
			'p-2',
			'inline-flex',
			'flex-col',
			'relative',
			'transition-all',
			'outline',
			'outline-transparent',
			'outline-2',
			'focus-within:outline-black'
		];
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

		return clazz + ' ' + classes.join(' ');
	};
</script>

{#if label}
	<label for={id} class="block mb-2">{label}</label>
{/if}
<div class={`${getClasses()}`}>
	<input
		{id}
		type="text"
		class="focus:outline-none"
		{placeholder}
		bind:value
		on:focus
		bind:this={inputElement}
	/>
	<SearchIcon class="absolute right-2 bg-white" />
</div>
