<script lang="ts">
	import Checkmark from 'virtual:icons/fluent/checkmark-12-filled';

	export let label: string;
	export let id: string;
	export let checked: boolean;
</script>

<label for={id} class="group flex items-center hover:cursor-pointer">
	<input
		{id}
		type="checkbox"
		bind:checked
		on:change
		class="absolute opacity-0 w-6 h-6 cursor-pointer"
	/>
	<div
		class={`h-6 w-6 flex items-center justify-center rounded border border-slate-500 transition-all ${
			checked
				? 'bg-wmp shadow-box shadow-ida-blue group-hover:bg-wmp-darker'
				: 'bg-white group-hover:bg-ida-blue shadow-none'
		}`}
	>
		<Checkmark
			class={`${
				checked ? 'w-5 h-5 rotate-0 group-hover:scale-95' : 'h-4 w-4 rotate-6'
			} text-white transition-all`}
		/>
	</div>
	<span class="pl-4 font-light">{label}</span>
</label>
