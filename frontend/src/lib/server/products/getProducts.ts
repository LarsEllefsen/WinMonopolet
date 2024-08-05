import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { VinmonopoletProduct } from '../../../types/product';
import { APIError } from '../APIError';
import { GET } from '../GET';

export const getProducts = async (params: URLSearchParams) => {
	const products = await GET<VinmonopoletProduct[]>(`${env.API_URL}/api/products?${params}`);

	if (products instanceof APIError) {
		console.warn(`Unable to fetch products with params ${params}: ${products.message}`);
		throw error(500, 'Noe gikk galt, vennligst prøv igjen senere');
	}

	return products;
};
