import { POST } from '../POST';
import { env } from '$env/dynamic/private';
import type { SessionToken } from '../session/sessionToken';

export const addUserToQueue = (sessionToken: SessionToken) => {
	if (!sessionToken.getUserId())
		throw new Error('Unable to add user to queue, no userId found in sessionToken');
	return POST<void>(`${env.API_URL}/api/user/queue`, {}, sessionToken);
};
