import { env } from '$env/dynamic/private';

import { createOrUpdateUser } from '../user/createOrUpdateUser';
import jwt from 'jsonwebtoken';
import { SessionToken } from './sessionToken';

/**
 * Creates a new user session.
 * If the Untappd API rate limit is triggered, well, that sucks.
 * @param {string} accessToken - The users OAuth access token
 */
export const createSession = async (accessToken: string) => {
	// Updates the user with latest information from the untappd api
	const user = await createOrUpdateUser(accessToken);
	const sessionToken = new SessionToken(accessToken, user.id.toString());

	const sessionCookie = jwt.sign(user, env.JWT_SECRET);

	return { user, sessionCookie, sessionToken };
};
