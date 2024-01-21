import { env } from '$env/dynamic/private';
import type { User } from '../../../types/user';
import { updateAndGetUser } from '../user/createOrUpdateUser';
import { getAuthenticatedUser } from '../user/getAuthenticatedUser';
import jwt from 'jsonwebtoken';
import type { SessionToken } from './sessionToken';
import { addUserToQueue } from '../user/addUserToQueue';

/**
 * Given an existing session-token, get user data from server.
 * If the Untappd API rate limiting is triggered, return the 'cached' user from the database.
 * @param {string} accessToken - The users OAuth access token
 * @param {string} userId - The user id
 */
export const refreshSession = async (sessionToken: SessionToken) => {
	let user: User;
	try {
		// Updates the user with latest information from the untappd api
		console.time('updateAndGetUser');
		user = await updateAndGetUser(sessionToken);
		console.timeEnd('updateAndGetUser');
		await addUserToQueue(sessionToken);
	} catch (error: any) {
		if (error?.status === 429) {
			// If we trigger the untappd rate limit, use the 'cached' user from the database.
			user = await getCachedUser(sessionToken);
		} else {
			throw error;
		}
	}

	const sessionCookie = jwt.sign(user, env.JWT_SECRET);

	return { user, sessionCookie };
};

const getCachedUser = async (sessionToken: SessionToken) => {
	if (!sessionToken.getUserId())
		throw new Error('Unable to get cached user: sessionToken is missing userId');

	return getAuthenticatedUser(sessionToken);
};
