import { env } from '$env/dynamic/private';
import { DELETE } from '../../DELETE';
import type { SessionToken } from '../../session/sessionToken';

export const deleteFavoriteStore = async (storeId: string, sessionToken: SessionToken) => {
	const userId = sessionToken.getUserId();
	if (userId === undefined)
		throw new Error('Unable to get user products: No userid in session-token');
	await DELETE(`${env.API_URL}/api/user/favorite_stores/${storeId}`, sessionToken);
};
