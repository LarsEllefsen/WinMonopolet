<script lang="ts">
	export let href: string;
</script>

<a
	class="md:text-3xl text-2xl border-b-2 border-transparent hover:border-black transition-all hover:pl-2"
	{href}><slot /></a
>
