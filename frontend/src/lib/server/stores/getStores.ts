import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { Store } from '../../../types/store';
import { APIError } from '../APIError';
import { GET } from '../GET';
import { SessionToken } from '../session/sessionToken';
import { getFavoriteStores } from '../user/favoriteStores/getFavoriteStores';

export const getStores = async (sessionToken?: SessionToken) => {
	const stores = await GET<Store[]>(`${env.API_URL}/api/stores`);
	if (stores instanceof APIError) {
		throw error(500, 'Noe gikk galt, vennligst prøv igjen senere');
	}

	return stores;
};
