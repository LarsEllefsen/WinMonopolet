<script lang="ts">
	export let id: string;
	export let name: string;
	export let label: string;
	export let value: string;
	export let group: string;

	$: selected = group === value;
</script>

<div class="gap-x-2 group">
	<label class="relative flex items-center gap-x-2 leading-tight" for={id}>
		<div
			class={`absolute w-4 h-4 rounded-full border  group-hover:bg-ida-blue group-checked:bg-red-500 p-[2px] ${
				selected ? 'border-wmp-dark' : 'border-slate-500'
			}`}
		>
			{#if selected}
				<div class="w-full h-full rounded-full bg-wmp" />
			{/if}
		</div>
		<input {name} class=" w-4 h-4 opacity-50 peer" type="radio" {id} {value} bind:group />
		<span
			class={`cursor-pointer group-hover:underline ${selected ? 'font-semibold' : 'font-normal'}`}
			>{label}</span
		>
	</label>
</div>
