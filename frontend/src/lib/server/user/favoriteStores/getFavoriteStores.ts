import { env } from '$env/dynamic/private';
import type { FavoriteStore } from '../../../../types/store';
import { GET } from '../../GET';
import type { SessionToken } from '../../session/sessionToken';

export const getFavoriteStores = (sessionToken: SessionToken) => {
	const userId = sessionToken.getUserId();
	if (userId === undefined)
		throw new Error('Unable to get user products: No userid in session-token');
	return GET<FavoriteStore[]>(`${env.API_URL}/api/user/favorite_stores`, sessionToken);
};
