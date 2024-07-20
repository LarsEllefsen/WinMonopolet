<script lang="ts">
	let clazz = '';

	export { clazz as class };
</script>

<div class={`${clazz} bg-red-200 p-8 rounded-md font-bold`}>
	<slot />
</div>
