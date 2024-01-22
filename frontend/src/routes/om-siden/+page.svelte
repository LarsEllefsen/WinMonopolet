<script lang="ts">
	import Heading from '$lib/components/heading/Heading.svelte';
	import PageLayout from '$lib/views/layout/PageLayout.svelte';
	import AlertIcon from 'virtual:icons/mdi-light/alert-circle';
</script>

<PageLayout>
	<Heading level={1} class="text-center">Om siden</Heading>
	<div class="grid grid-cols-12 md:mt-12 mt-4 gap-x-4 gap-y-8">
		<div class="md:col-span-6 col-span-full flex flex-col gap-y-8">
			<div>
				<p>Siden er laget og vedlikeholdt av Lars Moe Ellefsen, og drives kun på en hobbybasis.</p>
				<p>Siden er på ingen måte affiliert med Vinmonopolet,</p>
			</div>

			<div>
				<p>
					All data om lagerstatus, butikker og annen logistisk info er hentet fra <a
						class="text-link"
						target="_blank"
						rel="noopener"
						href="https://github.com/LarsEllefsen/WinMonopolet">Vinmonopolet</a
					>
					sine nettsider. Bilde, rating og diverse ekstra info om hver enkelt øl hentes fra
					<a target="_blank" rel="noopener" class="text-link" href="https://www.untappd.com/"
						>Untappd</a
					>.
				</p>
			</div>

			<div>
				<p>
					Det å matche tusenvis av øl på Vinmonopolet opp mot Untappd er ikke lett. På grunn av
					manglende konsistens mellom Vinmonopolet og Untappd sin navngiving av øl, så det kan det
					forekomme feil. (Det burde virkelig finnes en ISBN for øl).
				</p>
			</div>

			<div>
				<p>
					Siden oppdaterer fra Vinmonopolet hver sjette time, så lagerstatusen kan ha en liten
					feilmargin. Data fra Untappd hentes når en ny øl blir lagt til, og øl-ratinger oppdateres
					kontinuerlig for å holde siden så oppdatert som mulig. På grunn av en alt for lav
					API-grense har jeg ikke mulighet til å holde alle øl oppdatert til enhver tid, så noen
					utdaterte ratinger kan forekomme.
				</p>
			</div>

			<div>
				<p>
					Du kan enkelt melde ifra om slike feil ved å trykke på "Meld om feil" knappen <AlertIcon
						class="inline-block"
					/> knappen på produktet det gjelder.
				</p>
			</div>
		</div>
		<div class="col-span-6 md:col-start-auto col-start-4">
			<img
				class="w-[336px] object-cover"
				src="/images/lars_transparent.png"
				alt="En illustrasjon av Lars, Winmonopolet sin skaper og kjære far, som smelter mens han holder et teku-glass fylt med deilig, deilig øl"
			/>
		</div>
	</div>
</PageLayout>
