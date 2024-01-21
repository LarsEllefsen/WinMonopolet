<script lang="ts">
	import type { Store } from '../../../types/store';
	import AddFavoriteButton from './AddFavoriteButton.svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	export let store: Store;

	let isLoggedIn = $page.data.isAuthenticated;

	const addFavoriteStore = () => {
		return fetch('/api/user/favorite_stores', {
			method: 'POST',
			body: JSON.stringify({ storeId: store.store_id }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	const removeFavoriteStore = () => {
		return fetch(`/api/user/favorite_stores/${store.store_id}`, {
			method: 'DELETE'
		});
	};

	const handleAddFavoriteClick = async () => {
		const response = store.favorite ? await removeFavoriteStore() : await addFavoriteStore();
		if (!response.ok) console.error('My bad b');

		await invalidateAll();
	};
</script>

<li class="relative">
	<div
		class={`border border-black rounded-md mb-4 flex justify-between items-center pr-6 mr-4 background-color-slide shadow-box-md shadow-ida-blue-opacity`}
	>
		<a class="flex p-6 w-full" href={`/butikk/${store.store_id}`}>
			<div class="">
				<h3 class="font-semibold text-lg">{store.name}</h3>
				<span class="font-light">{store.address}</span>

				{#if store.distanceTo !== undefined}
					<p class="mt-2">{store.distanceTo.toFixed(2)} km unna</p>
				{/if}
			</div>
		</a>
	</div>
	{#if isLoggedIn}
		<AddFavoriteButton isFavorite={store.favorite} on:click={handleAddFavoriteClick} />
	{/if}
</li>
