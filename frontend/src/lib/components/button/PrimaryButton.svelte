<script lang="ts">
	export let type: 'submit' | 'button' | 'reset' | null | undefined;
</script>

<button
	{type}
	class="py-4 px-6 mt-4 text-white bg-wmp rounded-md focus-visible:ring-4 hover:bg-wmp-darker focus-visible:bg-wmp-darker"
	on:click
>
	<slot />
</button>
