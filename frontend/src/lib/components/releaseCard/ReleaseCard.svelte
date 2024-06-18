<script lang="ts">
	import { getReadableDateFormat } from '$lib/utils/getReadableDateFormat';

	export let releaseDate: Date;

	const releaseID = releaseDate.toISOString().split('T')[0];
</script>

<a
	class="xl:px-4 xl:py-8 px-2 py-8 block text-center border border-black rounded-lg background-color-slide shadow-ida-blue-opacity shadow-box-md group"
	href={`/nyhetslanseringer/${releaseID}`}
>
	<h3 class="font-semibold group-hover:underline">
		{getReadableDateFormat(releaseDate)}
	</h3>
</a>
