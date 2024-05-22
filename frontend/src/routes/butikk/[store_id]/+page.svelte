<script lang="ts">
	import { page } from '$app/stores';
	import StockView from '$lib/views/stock/StockView.svelte';
	import type { Store } from '../../../types/store';

	$: currentStore = $page.data.stores.find(
		(store: Store) => store.store_id === $page.params.store_id
	);
</script>

<StockView stock={$page.data.stock} title={currentStore?.name} />
