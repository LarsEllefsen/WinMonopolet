import type { SessionToken } from './session/sessionToken';

export const authorizationHeader = (sessionToken: SessionToken) => {
	return `Bearer ${sessionToken.getValue()}`;
};
