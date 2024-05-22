<script lang="ts">
	import { page } from '$app/stores';
	import ReleaseCard from '$lib/components/releaseCard/ReleaseCard.svelte';
	import { sortDatesDesc } from '$lib/utils/sortDatesDesc';
	import type { Releases } from '../../types/releases';
	import Heading from '$lib/components/heading/Heading.svelte';
	import PageLayout from '$lib/views/layout/PageLayout.svelte';

	const releases: Releases = $page.data.releases;
	const upcomingReleases = releases.upcomingReleases.sort(sortDatesDesc);
	const previousReleases = releases.previousReleases.sort(sortDatesDesc);
</script>

<PageLayout>
	<Heading level={1} centered>Nyhetslanseringer</Heading>
	<div class="grid grid-cols-12 md:mt-12 mt-4 gap-x-4 lg:gap-y-12 gap-y-8">
		<div
			class="xl:col-span-6 lg:col-span-8 col-span-full xl:col-start-4 lg:col-start-3 text-center"
		>
			<p class="text-lg mb-8">
				Her kan du se en oversikt over alle kommende og tidligere lanseringer med alle produktene
				sortert etter Untappd rating. Dataen hentes fra <a
					class="text-link"
					href="https://www.vinmonopolet.no/content/lanseringer/kommende-lanseringer"
					>Vinmonopolet sine lanseringslister</a
				> og blir oppdatert forløpende.
			</p>

			<p class="font-light mb-8">
				Merk at noen produkter kan mangle i kommende lanseringer, ofte fordi produktet er så nytt at
				det ikke finnes en Untappd side for den enda, eller at den har så få ratings at den ikke har
				fått noen total rating enda.
			</p>

			<p class="font-light">
				Hvis du mener noen produkter mangler som burde vært med så send gjerne en mail til <a
					href="mailto:report@winmonopolet.no"
					class="text-link">report@winmonopolet</a
				> og forklar problemet.
			</p>
		</div>

		<div class="lg:col-span-8 col-span-full lg:col-start-3">
			<div class="lg:mb-16 mb-8">
				<h2 class="text-3xl lg:mb-8 mb-4">Kommende lanseringer:</h2>
				{#if upcomingReleases.length === 0}
					<p>Det er for tiden ikke noen kommende lanseringslister</p>
				{:else}
					<div class="grid grid-cols-12 lg:gap-8 gap-4">
						{#each upcomingReleases as upcomingRelease}
							<div class="xl:col-span-3 lg:col-span-4 col-span-6">
								<ReleaseCard releaseDate={upcomingRelease} />
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div>
				<h2 class="text-3xl lg:mb-8 mb-4">Tidligere lanseringer:</h2>
				<div class="grid grid-cols-12 lg:gap-8 gap-4">
					{#each previousReleases as previousReleaseDate}
						<div class="xl:col-span-3 lg:col-span-4 col-span-6">
							<ReleaseCard releaseDate={previousReleaseDate} />
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</PageLayout>
