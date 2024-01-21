<script lang="ts">
	import UntappdIcon from '~icons/arcticons/untappd';
	import VinmonopoletIcon from '~icons/arcticons/vinmonopolet';
	import StarIcon from 'virtual:icons/mingcute/star-fill';
	import Checkmark from 'virtual:icons/mdi/check-decagram';
	import AlertIcon from 'virtual:icons/mdi-light/alert-circle';
	import type { Stock } from '../../../types/stock';
	import { createEventDispatcher } from 'svelte';

	export let stock: Stock;
	export let index: number;

	const dispatch = createEventDispatcher();
</script>

<div
	class="grid grid-cols-12 md:gap-y-4 gap-y-2 p-4 border border-slate-500 rounded-lg shadow-box-md shadow-ida-blue-opacity relative"
>
	<div
		class="bg-wmp rounded text-white w-9 h-9 text-lg flex items-center justify-center font-semibold absolute left-[-1rem] top-[-1rem]"
	>
		<span class="z-10">{index + 1}</span>
	</div>
	{#if stock.product.is_new}
		<div
			class="bg-orange-400 text-white text-xs rotate-12 w-12 h-12 flex items-center rounded-full justify-center font-semibold absolute left-[80px] top-[-6px]"
		>
			Nyhet
		</div>
	{/if}
	{#if stock.product.has_had}
		<div class="absolute -right-3 -top-2">
			<Checkmark class=" text-untappd fill-white w-8 h-8 relative z-10" />
			<div class="absolute w-6 h-6 rounded-full bg-white bottom-1 right-1" />
		</div>
	{/if}

	<div class="md:col-span-2 sm:row-span-2 sm:col-span-2 xs:col-span-3 col-span-4">
		<img
			src={stock.product.untappd.picture_url}
			alt=""
			class="w-28 h-28 sm:object-scale-down object-contain"
		/>
	</div>
	<div class="md:col-span-8 sm:col-span-8 xs:col-span-9 col-span-8 ml-4">
		<div>
			<h3 class="md:text-xl text-xl font-bold leading-tight">{stock.product.vmp_name}</h3>

			<p class="md:text-lg text-base">{stock.product.untappd.brewery}</p>
			<p class="font-light">{stock.product.untappd.style}</p>
		</div>
	</div>

	<div class="md:col-span-2 col-span-4 flex items-center md:items-start md:justify-end">
		<div class="flex items-center gap-x-2 leading-tight">
			<StarIcon class="text-untappd w-6 h-6" />
			<span class="">{stock.product.untappd.rating.toFixed(2)}</span>
		</div>
	</div>

	<div class="md:ml-4 sm:col-span-8 sm:col-start-3 col-span-full md:mt-0 mt-2">
		<div
			class="flex flex-row flex-wrap gap-y-4 h-full md:gap-x-4 gap-x-2 items-center font-light md:text-base text-sm"
		>
			<p class="lg:p-0 lg:border-0 border border-slate-500 rounded-full md:px-42 py-1 px-2">
				<span class="lg:inline-block hidden">Pris:</span>
				<span class="inline-block">{stock.product.price} kr</span>
			</p>
			<p class="lg:p-0 lg:border-0 border border-slate-500 rounded-full md:px-4 py-1 px-2">
				<span class="lg:inline-block hidden">Styrke:</span>
				<span class="inline-block">{stock.product.untappd.abv}%</span>
			</p>
			<p class="lg:p-0 lg:border-0 border border-slate-500 rounded-full md:px-4 py-1 px-2">
				<span class="lg:inline-block hidden">Volum:</span>
				<span class="inline-block">{stock.product.container_size}</span>
			</p>
			<p class="lg:p-0 lg:border-0 border border-slate-500 rounded-full md:px-4 py-1 px-2">
				<span class="lg:inline-block hidden">På lager:</span>
				<span class="inline-block">{stock.stock_level} stk</span>
			</p>
		</div>
	</div>

	<div
		class="md:row-start-auto md:col-span-2 sm:col-span-8 xs:col-span-9 col-span-8 col-start-5 ml-2 row-start-2"
	>
		<div class="flex gap-x-2 md:justify-end">
			<a
				class="inline-flex items-center gap-x-2 p-2 border-slate-500 rounded-md vinmonopolet-link-button"
				target="_blank"
				rel="noopener noreferrer"
				href={stock.product.vmp_url}
			>
				<VinmonopoletIcon class="stroke-2 w-5 h-5" />
			</a>
			<a
				class="inline-flex items-center gap-x-2 p-2 border-slate-500 rounded-md transition-all untappd-link-button"
				target="_blank"
				rel="noopener noreferrer"
				href={stock.product.untappd.untappd_url}
			>
				<UntappdIcon class="stroke-2 w-5 h-5" />
			</a>
			<button on:click={() => dispatch('reportError')} class="p-2 report-button rounded-md group"
				><AlertIcon class="stroke-1 w-5 h-5 group-hover:text-white" /></button
			>
		</div>
	</div>
</div>

<style>
	.untappd-link-button {
		background: radial-gradient(circle, #ffc000 20%, rgba(252, 70, 107, 0) 100%);
		background-size: 0% 0%;
		background-position: center;
		background-repeat: no-repeat;
		transition-timing-function: ease-out;
		transition-duration: 0.3s;
	}

	.untappd-link-button:hover {
		background-size: 300% 300%;
		border-color: transparent;
	}

	.vinmonopolet-link-button {
		color: black;
		transition: all;
		background: radial-gradient(circle, var(--ida-blue) 20%, rgba(252, 70, 107, 0) 100%);
		background-size: 0% 0%;
		background-position: center;
		background-repeat: no-repeat;
		transition-timing-function: ease-out;
		transition-duration: 0.3s;
	}

	.vinmonopolet-link-button:hover {
		background-size: 300% 300%;
		color: black;
		border-color: transparent;
	}

	.report-button {
		color: black;
		transition: all;
		background: radial-gradient(circle, rgb(255, 67, 67) 20%, rgba(252, 70, 107, 0) 100%);
		background-size: 0% 0%;
		background-position: center;
		background-repeat: no-repeat;
		transition-timing-function: ease-out;
		transition-duration: 0.3s;
	}

	.report-button:hover {
		background-size: 300% 300%;
		color: black;
		border-color: transparent;
	}
</style>
