<script lang="ts">
	import type { Store } from '../../../types/store';
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import StarIcon from 'virtual:icons/mdi/star';
	import Cancel from 'virtual:icons/mdi/remove';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

	export let open = false;
	let currentNumberOfFavoritedStores: number | undefined = undefined;

	$: newStoreAdded = false;
	$: favoriteStores = $page.data.stores.filter((store) => store.favorite) as Store[];
	$: {
		if (currentNumberOfFavoritedStores === undefined) {
			currentNumberOfFavoritedStores = favoriteStores.length;
		}
		if (favoriteStores.length > currentNumberOfFavoritedStores) {
			newStoreAdded = true;
		}

		currentNumberOfFavoritedStores = favoriteStores.length;
	}
	$: {
		if (newStoreAdded) {
			console.log('TRIGGER SOMETHING');
			setTimeout(() => {
				newStoreAdded = false;
			}, 500);
		}
	}

	const removeFavoriteStore = async (storeId: string) => {
		const response = await fetch(`/api/user/favorite_stores/${storeId}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			invalidateAll();
		}
	};
</script>

<div class="relative flex items-end">
	<button class="items-center justify-center relative group" on:click>
		<StarIcon
			class={`h-8 w-8 z-50 stroke-black transition-all ${open ? 'text-untappd' : 'text-white'}`}
		/>
		<StarIcon
			class={`h-8 w-8 stroke-black absolute top-0 -z-10 ${newStoreAdded ? 'animate-ping ' : ''}`}
		/>
	</button>

	{#if open}
		<div
			transition:slide|global
			class="absolute top-12 md:left-0 -left-28 bg-white border border-black rounded-md w-64 overflow-hidden shadow-lg"
		>
			<div class="p-4">
				<h2 class="text-center font-semibold">Dine favorittbutikker</h2>
			</div>
			{#if favoriteStores.length === 0}
				<div class="p-4">
					<p>Du har ingen favorittbutikker enda.</p>
				</div>
			{:else}
				<ul>
					{#each favoriteStores as favoriteStore}
						<li class="relative">
							<a
								href={`/butikk/${favoriteStore.store_id}`}
								class="block p-4 w-full background-color-slide"
								on:click>{favoriteStore.name}</a
							>
							<button
								class="p-2 absolute right-0 top-3 group"
								on:click={() => removeFavoriteStore(favoriteStore.store_id)}
								><Cancel
									class="w-5 h-5 transition-transform group-hover:border border-black rounded-full"
								/></button
							>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</div>
