import { env } from '$env/dynamic/private';
import type { User } from '../../../types/user';
import { POST } from '../POST';
import { SessionToken } from '../session/sessionToken';
/**
 * Sends a POST request to the server with the access token as an Authorization header.
 * The server uses this access token to GET the user data from untappd and create a user in our system if it does not already exist, else it updates it.
 * Returns the created/updated user.
 */
export const createOrUpdateUser = async (accessToken: string) => {
	return POST<User>(`${env.API_URL}/api/user`, {}, new SessionToken(accessToken));
};

export const updateAndGetUser = async (sessionToken: SessionToken) => {
	if (!sessionToken.getUserId())
		throw new Error('Unable to update user: no user id found in sessionToken');

	return POST<User>(`${env.API_URL}/api/user`, {}, sessionToken);
};
