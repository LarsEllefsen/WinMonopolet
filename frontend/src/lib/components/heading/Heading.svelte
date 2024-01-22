<script lang="ts">
	export let level: 1 | 2 | 3 | 4;
	export let centered = false;
	export { clazz as class };

	let clazz: string = '';
</script>

{#if level === 1}
	<h1 class={`md:text-5xl text-4xl mb-8 ${centered ? 'text-center' : undefined} ${clazz}`}>
		<slot />
	</h1>
{:else if level === 2}
	<h2 class={`text-3xl mb-4 ${centered ? 'text-center' : undefined} ${clazz}`}><slot /></h2>
{:else if level === 3}
	<h3 class={`text-2xl mb-4 ${centered ? 'text-center' : undefined} ${clazz}`}><slot /></h3>
{:else if level === 4}
	<h4 class={`text-xl mb-4 ${centered ? 'text-center' : undefined} ${clazz}`}><slot /></h4>
{/if}
