<script lang="ts">
	import type { BannerColor } from '../../../types/banner';

	let clazz = '';
	const colorMap: { [key in BannerColor]: string } = {
		red: 'bg-red-200',
		blue: 'bg-ida-blue-opacity',
		green: 'bg-green-200'
	};

	export let color: BannerColor;
	export { clazz as class };
</script>

<div class={`${clazz} ${colorMap[color]} p-8 rounded-md font-semibold`}>
	<slot />
</div>
