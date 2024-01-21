<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let open = false;

	const dispatch = createEventDispatcher();
</script>

<button
	class={`tham tham-e-squeeze tham-w-8 ${open ? 'tham-active' : ''}`}
	on:click={() => dispatch('click')}
>
	<div class="tham-box">
		<div class="tham-inner !h-[2px] before:!h-[2px] after:!h-[2px]" />
	</div>
</button>
