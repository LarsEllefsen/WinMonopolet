import { env } from '$env/dynamic/private';
import { GET } from '$lib/server/GET.js';
import { getReadableDateFormat } from '$lib/utils/getReadableDateFormat';
import type { UpcomingProduct } from '../../../types/product';
import type { Stock } from '../../../types/stock';

export async function load({ params }) {
	const productsInRelease = await GET<UpcomingProduct[]>(
		`${env.API_URL}/api/releases/${params.release_id}`
	);

	const stock = productsInRelease.map(
		({ vinmonopoletProduct }) => ({ stock_level: 0, product: vinmonopoletProduct } satisfies Stock)
	);
	return {
		releaseDate: `Nyhetslansering ${getReadableDateFormat(
			new Date(productsInRelease[0].releaseDate)
		)}`,
		stock
	};
}
