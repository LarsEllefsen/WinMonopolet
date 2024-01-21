<script lang="ts">
	import { onMount } from 'svelte';

	export let limiter: number;
	export let maxLength: number;
	export let incrementBy: number;
	export let usePageScroll = false;

	let instance: HTMLElement;
	let scrollParent: HTMLElement | null = null;

	const onElementScroll = () => {
		if (limiter >= maxLength || !scrollParent) return;
		const remainingScroll =
			scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight;

		if (remainingScroll < 10) limiter += incrementBy;
	};

	const onPageScroll = () => {
		if (limiter >= maxLength) return;
		const remainingScroll = document.body.scrollHeight - window.innerHeight - window.scrollY;

		if (remainingScroll < 10) limiter += incrementBy;
	};

	const setUpElementScroll = () => {
		scrollParent = instance.parentElement;
		if (!scrollParent) throw new Error('Unable to find scrollParent');
		scrollParent.addEventListener('scroll', onElementScroll);

		return () => scrollParent?.removeEventListener('scroll', onElementScroll);
	};

	const setUpWindowScroll = () => {
		window.addEventListener('scroll', onPageScroll);
		return () => window.removeEventListener('scroll', onPageScroll);
	};

	onMount(() => {
		const cleanupFunction = usePageScroll ? setUpWindowScroll() : setUpElementScroll();

		return cleanupFunction;
	});
</script>

<div class="infinite-loader" bind:this={instance} />
