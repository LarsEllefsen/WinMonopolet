import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { Stock } from '../../../types/stock';
import { APIError } from '../APIError';
import { GET } from '../GET';

export const getStock = async (storeId: string) => {
	const stock = await GET<Stock[]>(`${env.API_URL}/api/stores/${storeId}/products`);
	if (stock instanceof APIError) {
		throw error(500, 'Noe gikk galt, vennligst prøv igjen senere');
	}

	return stock;
};
