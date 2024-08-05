import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { UpcomingProduct } from '../../../types/product';
import { APIError } from '../APIError';
import { GET } from '../GET';

export const getProductsInRelease = async (releaseId: string) => {
	const productsInRelease = await GET<UpcomingProduct[]>(
		`${env.API_URL}/api/releases/${releaseId}`
	);

	if (productsInRelease instanceof APIError) {
		throw error(500, 'Noe gikk galt, vennligst prøv igjen senere');
	}

	return productsInRelease;
};
