import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { User } from '../../../types/user';
import { APIError } from '../APIError';
import { GET } from '../GET';
import type { SessionToken } from '../session/sessionToken';

export const getAuthenticatedUser = async (sessionToken: SessionToken) => {
	const user = await GET<User>(`${env.API_URL}/api/user`, sessionToken);
	if (user instanceof APIError) {
		console.warn(
			`Something went wrong when fetching authenticated user ${sessionToken.getUserId()}`
		);
		throw error(500, 'Noe gikk galt, vennligst prøv igjen senere');
	}
	return user;
};
