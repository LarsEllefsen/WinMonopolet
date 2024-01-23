<script>
	import Heading from '$lib/components/heading/Heading.svelte';
	import PageLayout from '$lib/views/layout/PageLayout.svelte';
	import PayPalLogo from 'virtual:icons/mingcute/paypal-fill';
</script>

<PageLayout>
	<Heading level={1} class="text-center">Ønsker du å bidra?</Heading>
	<div class="grid grid-cols-12 gap-y-12">
		<div class="md:col-span-6 md:col-start-4 col-span-full">
			<p>
				Alle er velkommene til å bidra! Siden er open source og kan finnes på <a
					class="text-link"
					href="https://www.github.com"
					target="_blank"
				>
					Github
				</a>. Her kan du bidra ved å lage en pull request på hva som helst, enten det er en
				funksjonalitet, fikse en feil eller generelt hjelpe til med å gjøre Winmonopolet så bra som
				mulig!
			</p>
		</div>

		<div class="md:col-span-6 md:col-start-4 col-span-full">
			<Heading level={2}>Donere</Heading>
			<p>
				Hvis du ønsker å bidra til kostnadene rundt driften og vedlikeholdt av siden kan du donere
				via <a
					class="text-link"
					target="_blank"
					href="https://www.paypal.com/donate/?hosted_button_id=2Y6AYNAR7L3T2">PayPal</a
				>
				eller
				<a class="text-link" target="_blank" href="https://www.buymeacoffee.com/larsellefsen"
					>Buy Me A Coffee</a
				>.
			</p>
			<p class="mt-4">
				Dette er <b>helt valgfritt</b> og siden kommer til å eksistere så lenge som mulighet uavhengig
				av donasjoner. Alle donasjoner settes pris på og vil bli brukt til å dekke alle kostander rundt
				drift og vedlikehold av siden.
			</p>
			<div class="flex gap-x-4 items-center mt-8">
				<a
					target="_blank"
					href="https://www.paypal.com/donate/?hosted_button_id=2Y6AYNAR7L3T2"
					class="inline-flex items-center gap-x-2 py-4 px-6 text-white bg-wmp rounded-md focus-visible:ring-4 hover:bg-wmp-darker focus-visible:bg-wmp-darker"
					><span>Doner</span> <PayPalLogo /></a
				>
				<a
					href="https://www.buymeacoffee.com/larsellefsen"
					class="bg-wmp px-4 py-4 rounded-md text-white focus-visible:ring-4 hover:bg-wmp-darker focus-visible:bg-wmp-darker"
					>🍻 Buy me a beer</a
				>
			</div>
		</div>
	</div>
</PageLayout>
