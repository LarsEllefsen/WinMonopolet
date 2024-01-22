<script>
	import Heading from '$lib/components/heading/Heading.svelte';
	import PageLayout from '$lib/views/layout/PageLayout.svelte';
</script>

<PageLayout>
	<Heading level={1} centered>Kontakt</Heading>
	<div class="grid grid-cols-12">
		<div class="col-span-12 text-center">
			<p class="font-semibold mb-4">Har du ris, ros, ideer til siden eller funnet en feil?</p>
			<p>
				Du kan komme i kontakt med meg ved å sende en epost til <a
					class="text-link"
					href="mailto:lars@winmonopolet.com">lars@winmonopolet.com</a
				>
			</p>
		</div>
	</div>
</PageLayout>
