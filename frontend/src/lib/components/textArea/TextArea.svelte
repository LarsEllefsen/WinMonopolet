<script lang="ts">
	export let name: string = '';
	export let id: string;
	export let value: string = '';
	export let label: string | null = null;
	export let placeholder: string = '';
	export let inputElement: HTMLTextAreaElement | undefined = undefined;
</script>

<div class="flex flex-col-reverse">
	<textarea
		{name}
		{id}
		{placeholder}
		class="border border-black rounded-md w-full p-2 peer outline-none focus-visible:ring-1 focus-visible:border-ida-blue focus-visible:shadow-box focus-visible:shadow-ida-blue"
		rows="3"
		bind:value
		on:focus
		bind:this={inputElement}
	/>
	{#if label}
		<label for={id} class="block mb-2 font-light peer-focus-visible:font-semibold">{label}</label>
	{/if}
</div>
