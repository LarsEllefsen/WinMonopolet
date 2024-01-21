import { env } from '$env/dynamic/private';
import { DELETE } from '../DELETE';
import type { SessionToken } from '../session/sessionToken';

export const deleteUser = async (sessionToken: SessionToken) => {
	return DELETE(`${env.API_URL}/api/user`, sessionToken);
};
