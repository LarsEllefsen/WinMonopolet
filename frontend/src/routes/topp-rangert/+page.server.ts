import { env } from '$env/dynamic/private';
import { GET } from '$lib/server/GET.js';
import type { VinmonopoletProduct } from '../../types/product.js';

export async function load({ locals, params }) {
	const topRatedProducts = await GET<VinmonopoletProduct[]>(
		`${env.API_URL}/api/products/?active=true&hasUntappdProduct=true&sortBy=rating&order=DESC&limit=100&offset=0`
	);

	return {
		products: topRatedProducts
	};
}
