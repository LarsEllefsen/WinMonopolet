<script lang="ts">
	import {
		hadBeers,
		importHadBeersFromFile,
		clearHadBeers
	} from '$lib/stores/hadBeers';

	let fileInput: HTMLInputElement | undefined;
	let errorMessage: string | undefined;
	let isImporting = false;

	const handleImportFile = async (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		errorMessage = undefined;
		isImporting = true;
		try {
			await importHadBeersFromFile(file);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Importen mislyktes.';
		} finally {
			isImporting = false;
			input.value = '';
		}
	};

	const handleClear = () => {
		errorMessage = undefined;
		clearHadBeers();
	};
</script>

<div class="px-2 mb-4 flex flex-col gap-y-2">
	<p class="mb-2 font-semibold">Mine øl</p>
	<input
		bind:this={fileInput}
		type="file"
		accept=".json"
		class="hidden"
		on:change={handleImportFile}
	/>
	<button
		class="bg-white border-2 border-wmp font-semibold hover:bg-wmp-light hover:text-white text-wmp py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
		disabled={isImporting}
		on:click={() => fileInput?.click()}
	>
		Importer Untappd-øl (JSON)
	</button>
	{#if $hadBeers.size > 0}
		<div class="flex items-center justify-between">
			<span class="font-light">{$hadBeers.size} øl importert</span>
			<button
				class="text-wmp font-light underline hover:text-wmp-darker"
				on:click={handleClear}>Fjern</button
			>
		</div>
	{/if}
	{#if errorMessage}
		<p class="text-sm text-red-600">{errorMessage}</p>
	{/if}
</div>
