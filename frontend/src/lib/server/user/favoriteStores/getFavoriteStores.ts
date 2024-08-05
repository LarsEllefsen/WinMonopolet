import { env } from '$env/dynamic/private';
import { APIError } from '$lib/server/APIError';
import type { FavoriteStore } from '../../../../types/store';
import { GET } from '../../GET';
import type { SessionToken } from '../../session/sessionToken';

export const getFavoriteStores = async (sessionToken: SessionToken) => {
	const userId = sessionToken.getUserId();
	if (userId === undefined)
		throw new Error('Unable to get user products: No userid in session-token');

	const favoriteStores = await GET<FavoriteStore[]>(
		`${env.API_URL}/api/user/favorite_stores`,
		sessionToken
	);

	if (favoriteStores instanceof APIError) {
		console.warn(`Unable to get favorite stores for user ${userId}: ${favoriteStores.message} `);
		return [];
	}

	return favoriteStores;
};
