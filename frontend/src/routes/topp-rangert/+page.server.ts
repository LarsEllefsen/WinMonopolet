import { env } from '$env/dynamic/private';
import { GET } from '$lib/server/GET.js';
import { redirect } from '@sveltejs/kit';
import type { VinmonopoletProduct } from '../../types/product.js';
import type { Stock } from '../../types/stock.js';

const getSearchParams = (params: URLSearchParams): URLSearchParams => {
	params.append('active', 'true');
	params.append('hasUntappdProduct', 'true');
	params.append('sortBy', 'rating');
	params.append('sort', 'DESC');
	params.append('limit', '100');
	params.append('offset', '0');

	return params;
};

export async function load({ url }) {
	if (url.searchParams.size === 0) throw redirect(308, '/topp-rangert?productCategory=%C3%98l');
	const params = getSearchParams(url.searchParams);
	const topRatedProducts = await GET<VinmonopoletProduct[]>(
		`${env.API_URL}/api/products?${params}`
	);
	const stock = topRatedProducts.map((product) => ({ product, stock_level: 0 } satisfies Stock));
	return {
		stock
	};
}
