<script lang="ts">
	import StarIcon from 'virtual:icons/mdi/star';

	export let isFavorite: boolean;
</script>

<button on:click class="absolute p-2 top-1/2 -translate-y-1/2 right-12 z-10 group">
	<StarIcon
		class={`w-7 h-7 ${
			isFavorite ? 'text-untappd' : 'text-white'
		} stroke-black group-hover:text-yellow-500`}
	/>
</button>
