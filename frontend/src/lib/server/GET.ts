import { error } from '@sveltejs/kit';
import { authorizationHeader } from './authorizationHeader';
import type { SessionToken } from './session/sessionToken';

/**
 * GET
 * @param url
 * @param accessToken
 * @returns
 */
export const GET = async <T>(url: string, sessionToken?: SessionToken): Promise<T> => {
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: sessionToken ? authorizationHeader(sessionToken) : '',
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw error(response.status, { message: response.statusText });
	}

	const data = await response.json();

	return data as T;
};
