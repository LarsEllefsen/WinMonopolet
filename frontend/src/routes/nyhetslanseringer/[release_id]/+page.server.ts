import { getProductsInRelease } from '$lib/server/releases/getProductsInRelease';
import { getReadableDateFormat } from '$lib/utils/getReadableDateFormat';
import type { Stock } from '../../../types/stock';

export async function load({ params }) {
	const productsInRelease = await getProductsInRelease(params.release_id);
	const stock = productsInRelease.map(
		({ vinmonopoletProduct }) => ({ stock_level: 0, product: vinmonopoletProduct } satisfies Stock)
	);
	return {
		title: `Nyhetslansering ${getReadableDateFormat(new Date(params.release_id))}`,
		stock
	};
}
