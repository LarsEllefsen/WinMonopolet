import { APIError } from './APIError';
import { authorizationHeader } from './authorizationHeader';
import type { SessionToken } from './session/sessionToken';

/**
 * GET
 * @param url
 * @param accessToken
 * @returns
 */
export const GET = async <T>(url: string, sessionToken?: SessionToken): Promise<T | APIError> => {
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: sessionToken ? authorizationHeader(sessionToken) : '',
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		return new APIError(response.status, response.statusText);
	}

	const data = await response.json();

	return data as T;
};
