import { env } from '$env/dynamic/private';
import { GET } from '$lib/server/GET.js';
import type { UpcomingProduct } from '../../../types/product';

export async function load({ locals, params }) {
	const productsInRelease = await GET<UpcomingProduct[]>(
		`${env.API_URL}/api/releases/${params.release_id}`
	);
	return {
		products: productsInRelease
	};
}
