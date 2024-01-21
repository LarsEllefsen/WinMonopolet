import { env } from '$env/dynamic/private';
import type { UserProduct } from '../../../types/product';
import { GET } from '../GET';
import type { SessionToken } from '../session/sessionToken';

export const getUserProducts = (sessionToken: SessionToken) => {
	const userId = sessionToken.getUserId();
	if (userId === undefined)
		throw new Error('Unable to get user products: No userid in session-token');
	return GET<UserProduct[]>(`${env.API_URL}/api/user/products`, sessionToken);
};
