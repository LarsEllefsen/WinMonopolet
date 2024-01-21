<script lang="ts">
	import RadioButton from './RadioButton.svelte';

	type RadioOptions = {
		label: string;
		value: string;
	};

	export let name: string;
	export let legend: string;
	export let options: RadioOptions[];
	export let selectedValue: string;
</script>

<div role="radiogroup">
	<p class="mb-4">{legend}</p>
	<div class="pl-1">
		{#each options as radioOption, index}
			<div class={index != 0 ? 'mt-4' : ''}>
				<RadioButton
					id={`${radioOption.value}-radio`}
					label={radioOption.label}
					value={radioOption.value}
					{name}
					bind:group={selectedValue}
				/>
			</div>
		{/each}
	</div>
</div>

<style>
	.bar {
		background: linear-gradient(to right, rgba(62, 76, 223, 1) 0.25rem, transparent 0.25rem);
		background-position-x: 16%;
	}
</style>
