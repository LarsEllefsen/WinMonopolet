<script lang="ts">
	import StorePicker from '$lib/components/storePicker/StorePicker.svelte';

	export let data;
</script>

<div class="container mx-auto p-4">
	<div class="grid grid-cols-12 lg:mt-20 mt-8">
		<div class="xl:col-span-6 xl:col-start-4 md:col-span-10 md:col-start-2 col-span-full">
			<img class="lg:w-3/4 w-full mx-auto" src="/images/logo.svg" alt="Winmonopolet logo" />

			<div class="grid grid-cols-12 lg:my-20 mt-12 mb-12">
				<div class="md:col-span-8 col-span-full">
					<p class="text-xl mb-8">
						<span class="text-wmp font-semibold">Winmonopolet</span> sitt mål er å gjøre det enkelt for
						deg å finne den beste ølen som passer akkurat til deg, og som er på lager på ditt foretrukne
						Vinmonopol akkurat nå.
					</p>
					<p class="mb-4 font-light">
						Ved å rangere alle øl i Vinmonopolet sitt sortiment opp mot <a
							href="https://www.untappd.com"
							class="">Untappd</a
						> blir det enkelt å se hvilke øl som scorer høyt, og om det er noen skjulte perler på lager.
					</p>

					<p class="font-light">Kom i gang ved å søke frem din foretrukne butikk nedenfor.</p>
				</div>

				<div class="md:col-span-3 md:col-start-10 md:mt-0 mt-12 col-span-2 col-start-6">
					<img src="/images/snirkel.svg" alt="Abstrakt (Og meget kul) illustrasjon av en snirkel" />
				</div>
			</div>

			<div id="pick-store">
				<StorePicker stores={data.stores} />
			</div>
		</div>
	</div>
</div>
