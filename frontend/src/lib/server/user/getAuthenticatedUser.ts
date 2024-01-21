import { API_URL } from '$env/dynamic/private';
import { env } from '$env/dynamic/private';
import type { User } from '../../../types/user';
import { GET } from '../GET';
import type { SessionToken } from '../session/sessionToken';

export const getAuthenticatedUser = async (sessionToken: SessionToken) => {
	return GET<User>(`${env.API_URL}/api/user`, sessionToken);
};
