<script lang="ts">
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';

	$: user = $page.data.user;

	export let open = false;
</script>

<div class="relative">
	{#if !user}
		<a href="/login">Logg inn</a>
	{:else}
		<button class="flex items-center gap-x-2 group" on:click>
			<img src={user?.userAvatar} class="w-8 h-8 rounded-full z-10" alt={'User profile picture'} />
			<div
				class={`absolute w-8 h-8 rounded-full outline outline-1 group-hover:scale-125 transition-all overflow-hidden ${
					open && 'scale-125'
				}`}
			/>
			<span class="group-hover:underline md:block hidden">{user?.firstName}</span>
		</button>

		{#if open}
			<div
				transition:slide|global
				class="w-36 absolute border top-12 p-4 rounded border-black bg-white"
			>
				<ul>
					<li class="mb-4"><a href="/profil">Min profil</a></li>
					<li><a href="/logg-ut" data-sveltekit-reload>Logg ut</a></li>
				</ul>
			</div>
		{/if}
	{/if}
</div>
