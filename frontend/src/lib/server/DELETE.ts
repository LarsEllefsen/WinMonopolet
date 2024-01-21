import { error } from '@sveltejs/kit';
import { authorizationHeader } from './authorizationHeader';
import type { SessionToken } from './session/sessionToken';

/**
 * @param {string} url - The url to POST to
 * @param {string} sessionToken - If presents, add as Authorization header
 */
export const DELETE = async <T>(url: string, sessionToken?: SessionToken): Promise<void> => {
	const authHeader = sessionToken ? authorizationHeader(sessionToken) : '';
	const response = await fetch(url, {
		method: 'DELETE',
		headers: {
			Authorization: authHeader,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw error(response.status, { message: response.statusText });
	}
};
