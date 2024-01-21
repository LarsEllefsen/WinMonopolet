<script lang="ts">
	import { slide } from 'svelte/transition';
	import Chevron from 'virtual:icons/mdi/chevron-down';

	export let label: string;
	export let startOpen: boolean;
	export { clazz as class };

	let clazz: string = '';

	$: open = startOpen;
</script>

<div class={clazz}>
	<button
		on:click={() => (open = !open)}
		class={`pb-2 mb-2 text-left outline-2 border-b w-full flex items-center collapsible group hover:text-wmp`}
	>
		{label}
		<div class={`transition ${open ? 'rotate-180' : 'rotate-0'} z-10`}>
			<Chevron style={'width:24px;height:24px;'} class="text-black group-hover:text-wmp-primary" />
		</div>
	</button>

	{#if open}
		<div transition:slide>
			<slot />
		</div>
	{/if}
</div>

<style global>
	.collapsible {
		--s: 0.2em; /* the thickness of the line */
		--c: rgb(62 76 223); /* the color */

		padding-bottom: var(--s);
		background: linear-gradient(90deg, var(--c) 50%, #000 0) calc(100% - var(--_p, 0%)) / 200% 100%,
			linear-gradient(var(--c) 0 0) 0% 100% / var(--_p, 0%) var(--s) no-repeat;
		-webkit-background-clip: text, padding-box;
		background-clip: text, padding-box;
		transition: 0.2s;
	}
	.collapsible:hover {
		--_p: 100%;
	}
</style>
