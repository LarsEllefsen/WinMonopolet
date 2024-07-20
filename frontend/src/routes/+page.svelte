<script lang="ts">
	import Heading from '$lib/components/heading/Heading.svelte';
	import StorePicker from '$lib/components/storePicker/StorePicker.svelte';
	import ReleaseCard from '$lib/components/releaseCard/ReleaseCard.svelte';
	import Banner from '$lib/components/banner/Banner.svelte';

	export let data;

	const upcomingReleases = data.releases.upcomingReleases;
</script>

<div class="container mx-auto p-4">
	<div class="grid grid-cols-12 lg:mt-20 mt-8">
		<div class="xl:col-span-6 xl:col-start-4 md:col-span-10 md:col-start-2 col-span-full">
			<img class="lg:w-3/4 w-full mx-auto" src="/images/logo.svg" alt="Winmonopolet logo" />

			<div class="grid grid-cols-12 lg:my-20 mt-12 mb-12">
				<div class="md:col-span-full col-span-full lg:mb-12 mb-8">
					<Banner>
						Det er for tiden problemer med apiet til Untappd. Frem til problemet er fikset vil ikke
						innlogging fungere, nye produkter i vinmonopolet sortiment vil ikke vises og
						eksisterende ratinger vil ikke bli oppdatert. <br /> <br />Beklager ulempen, det jobbes
						med saken!
					</Banner>
				</div>

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

					<p class="font-light">
						Kom i gang ved å <a class="text-link" href="#pick-store"
							>søke frem din foretrukne butikk</a
						> nedenfor eller utforsk hva annet Winmonopolet kan tilby ved å klikke på menyen øverst.
					</p>
				</div>

				<div class="md:col-span-3 md:col-start-10 md:mt-0 mt-12 col-span-2 col-start-6">
					<img src="/images/snirkel.svg" alt="Abstrakt (Og meget kul) illustrasjon av en snirkel" />
				</div>
			</div>

			{#if upcomingReleases.length > 0}
				<div class="col-span-full lg:mb-20 mb-12">
					<Heading level={2}>Kommende nyhetslansering</Heading>

					<p class="mb-4">
						Snart er det duket for nyhetslansering på Vinmonopolet og her kan du få en rangert liste
						over alle produktene som slippes i lanseringen.
					</p>

					<p class="font-light mb-8">
						Du kan få mer informasjon og se tidligere nyhetslanseringer ved å besøke <a
							href="/nyhetslanseringer"
							class="text-link">nyhetslanseringer</a
						> siden.
					</p>

					<div class="grid grid-cols-12">
						{#each upcomingReleases as releaseDate}
							<div class="lg:col-span-6 col-span-full">
								<ReleaseCard {releaseDate} />
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<div id="pick-store">
				<StorePicker stores={data.stores} />
			</div>
		</div>
	</div>
</div>
