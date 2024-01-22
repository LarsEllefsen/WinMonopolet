<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import Collapsible from '$lib/components/collapsible/Collapsible.svelte';
	import PageLayout from '$lib/views/layout/PageLayout.svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import Remove from 'virtual:icons/mdi/remove';

	const deleteUser = async () => {
		const response = await fetch('/api/user', {
			method: 'DELETE'
		});

		if (response.ok) {
			await goto('/logg-ut');
		} else {
			toast.push('Noe gikk galt, prøv igjen senere', {
				theme: {
					'--toastColor': 'white',
					'--toastBackground': 'rgb(255, 67, 67)'
				}
			});
		}
	};

	const removeFavoriteStore = async (storeId: string) => {
		const response = await fetch(`/api/user/favorite_stores/${storeId}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			invalidateAll();
		}
	};

	$: user = $page.data.user;
	$: favoriteStores = $page.data.stores.filter((store) => store.favorite);
</script>

<PageLayout>
	<div class="grid grid-cols-12 lg:gap-y-8 gap-y-4">
		<div class="lg:col-start-4 lg:col-span-6 col-span-full">
			<h1 class="lg:text-5xl text-4xl text-center lg:mb-24 mb-4">Din profil</h1>
			<div class="flex lg:flex-row flex-col gap-x-8 p-4">
				<img
					src={user.userAvatarHD ?? user.userAvatar}
					alt={`Profilbildet til untappdbrukeren ${user.userName}`}
					class="lg:w-[300px] lg:h-[300px] max-w-[300px] w-2/3 h-auto object-cover rounded-full mx-auto"
				/>
				<div class="w-full lg:pt-12 pt-8 flex flex-col">
					<h2 class="text-2xl mb-4">Hei {user.firstName}</h2>
					<p>Her kan du se og administere din informasjon.</p>
				</div>
			</div>
		</div>

		<div class="lg:col-span-6 lg:col-start-4 col-span-full p-4">
			<h2 class="mb-4 text-2xl">Administrer dine favorittbutikker</h2>
			{#if favoriteStores.length === 0}
				<p class="mb-4">Du har for øyeblikket ingen butikker som favoritter.</p>
				<p class="font-light">
					Du kan markere en butikk som favoritt ved å trykke på stjerneikonet når du søker opp
					butikker på forsiden.
				</p>
			{/if}
			<ul class="flex flex-col gap-y-4">
				{#each favoriteStores as favoriteStore}
					<li class="flex flex-row p-4 border border-black rounded-md justify-between items-center">
						<div class="flex flex-col">
							<h3 class="font-semibold text-lg">{favoriteStore.name}</h3>
							<p class="font-light">{favoriteStore.address}</p>
						</div>
						<button
							class="p-1 border-black hover:border rounded-full"
							on:click={() => removeFavoriteStore(favoriteStore.store_id)}
							><Remove class="h-6 w-6" /></button
						>
					</li>
				{/each}
			</ul>
		</div>

		<div class="lg:col-span-6 lg:col-start-4 col-span-full p-4">
			<h2 class="mb-4 text-2xl">Kommer snart: Ønskeliste</h2>
			<p class="mb-4">
				Få beskjed på epost når en av ølene på din <a
					href={`https://untappd.com/user/${user.userName}/wishlist`}
					class="text-link"
					target="_blank">Untappd ønskeliste</a
				> kommer på lager på en av dine favorittbutikker.
			</p>
		</div>

		<div class="lg:col-span-6 lg:col-start-4 col-span-full p-4">
			<h2 class="mb-4 text-2xl">Ofte stilte spørsmål</h2>
			<Collapsible label="Hva slags informasjon lagres?" startOpen={false} class="mb-8">
				<div class="p-4">
					<p class="mb-4">
						Kun grunnleggende informasjon som fornavn, brukernavn, oversikt over alle din checkins
						og ønskeliste, samt oversikt over dine favorittbutikker.
					</p>
					<p>Ønsker du å slette all data lagret om deg kan du gjøre det nederst på denne siden.</p>
				</div>
			</Collapsible>

			<Collapsible label="Noen av mine check-ins mangler" startOpen={false}>
				<div class="p-4">
					<p>
						På grunn av en begrensing fra Untappd kan man ikke gjøre flere enn 100 api-kall i timen.
						Hvis du har over 5000 check-ins kan det ta en time før alle check-ins er lagret ved
						første innlogging.
					</p>
				</div>
			</Collapsible>
		</div>

		<div class="col-span-6 col-start-4 p-4">
			<button class="p-4 bg-red-500 rounded-md text-white" on:click={deleteUser}
				>Slett bruker</button
			>
		</div>
	</div>
</PageLayout>
