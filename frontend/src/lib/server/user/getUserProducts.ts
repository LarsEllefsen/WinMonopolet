import { env } from '$env/dynamic/private';
import type { UserProduct } from '../../../types/product';
import { APIError } from '../APIError';
import { GET } from '../GET';
import type { SessionToken } from '../session/sessionToken';

export const getUserProducts = async (sessionToken: SessionToken) => {
	const userId = sessionToken.getUserId();
	if (userId === undefined)
		throw new Error('Unable to get user products: No userid in session-token');

	const userProducts = await GET<UserProduct[]>(`${env.API_URL}/api/user/products`, sessionToken);
	if (userProducts instanceof APIError) {
		console.warn(
			`Something went wrong fetching user products for user ${userId}: ${userProducts.message} `
		);
		return [];
	}

	return userProducts;
};
