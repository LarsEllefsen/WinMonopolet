<script>
	import PrimaryButton from '$lib/components/button/PrimaryButton.svelte';
	import PayPalLogo from 'virtual:icons/mingcute/paypal-fill';
</script>

<div class="container mx-auto md:mt-12 mt-8 p-4">
	<h1 class="md:text-5xl text-4xl text-center mb-8">Ønsker du å bidra?</h1>
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
			<h2 class="text-2xl mb-4">Donere</h2>
			<p>
				Hvis du ønsker å bidra til kostnadene rundt driften av siden kan du donere via <a
					class="text-link"
					target="_blank"
					href="https://www.paypal.com/donate/?hosted_button_id=2Y6AYNAR7L3T2">PayPal</a
				>.
			</p>
			<p class="mt-4">
				Dette er <b>helt valgfritt</b> og siden kommer til å eksistere så lenge som mulighet uavhengig
				av donasjoner. Alle donasjoner settes pris på og vil bli brukt til å dekke alle kostander rundt
				drift av siden.
			</p>
			<div class="">
				<a
					target="_blank"
					href="https://www.paypal.com/donate/?hosted_button_id=2Y6AYNAR7L3T2"
					class="inline-flex items-center gap-x-2 py-4 px-6 mt-4 text-white bg-wmp rounded-md focus-visible:ring-4 hover:bg-wmp-darker focus-visible:bg-wmp-darker"
					><span>Doner</span> <PayPalLogo /></a
				>
			</div>
		</div>
	</div>
</div>
