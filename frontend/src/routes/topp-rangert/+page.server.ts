import { redirect } from '@sveltejs/kit';
import type { Stock } from '../../types/stock.js';
import { getProducts } from '$lib/server/products/getProducts.js';

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
	const topRatedProducts = await getProducts(getSearchParams(url.searchParams));
	const stock = topRatedProducts.map((product) => ({ product, stock_level: 0 } satisfies Stock));
	return {
		stock
	};
}
