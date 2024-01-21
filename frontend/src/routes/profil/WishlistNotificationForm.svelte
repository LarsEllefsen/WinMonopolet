<script lang="ts">
	import { enhance } from '$app/forms';
	import Radio from '$lib/components/Radio/Radio.svelte';
	import PrimaryButton from '$lib/components/button/PrimaryButton.svelte';
	import EmailInput from '$lib/components/input/EmailInput.svelte';
	import { toast } from '@zerodevx/svelte-toast';

	let userHasOptedInForEmailNotification = false;
	const wishlistEmailNotificationOptions = [
		{
			label: 'Send meg epost hvis en vare kommer på lager',
			value: 'always'
		},
		{
			label: 'Send meg epost hvis en vare kommer på lager på en av mine favorittbutikker',
			value: 'onlyFavoriteStores'
		},
		{
			label: 'Nei, ikke send meg epost',
			value: 'no'
		}
	];

	let selectedWishListNotificationOption = 'always';
	let enteredEmail = '';
	$: userHasOptedInForEmailNotification =
		selectedWishListNotificationOption != 'no' && selectedWishListNotificationOption != '';
</script>

<!-- Work in progress -->
<form
	action="?/wishlistNotification"
	method="post"
	use:enhance={({ formElement }) => {
		return ({ result }) => {
			if (result.type === 'success') {
				toast.push('Endringene har blitt lagret', {
					theme: {
						'--toastColor': 'white',
						'--toastBackground': '#24a324'
					}
				});
				formElement.reset();
			} else {
				toast.push('Noe gikk galt, prøv igjen senere', {
					theme: {
						'--toastColor': 'white',
						'--toastBackground': 'rgb(255, 67, 67)'
					}
				});
			}
		};
	}}
>
	<Radio
		name="wishlistNotificationType"
		legend="Ønsker du å motta en epost når en av produktene på din ønskeliste kommer på lager?"
		options={wishlistEmailNotificationOptions}
		bind:selectedValue={selectedWishListNotificationOption}
	/>
	{#if userHasOptedInForEmailNotification}
		<div class="mt-4">
			<EmailInput
				name="wishlistNotificationEmail"
				id="email-input"
				label="Epost:"
				placeholder="Din epost.."
				bind:value={enteredEmail}
			/>
			<PrimaryButton type="submit">Lagre valg</PrimaryButton>
		</div>
	{/if}
</form>
