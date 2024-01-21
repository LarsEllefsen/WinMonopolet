import { error } from '@sveltejs/kit';
import { authorizationHeader } from './authorizationHeader';
import type { SessionToken } from './session/sessionToken';

/**
 * @param {string} url - The url to POST to
 * @param {object} body - The POST body
 * @param {string} sessionToken - If presents, add as Authorization header
 */
export const POST = async <T>(
	url: string,
	body?: object,
	sessionToken?: SessionToken
): Promise<T> => {
	const authHeader = sessionToken ? authorizationHeader(sessionToken) : '';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: authHeader,
			'Content-Type': 'application/json'
		},
		body: body ? JSON.stringify(body) : ''
	});

	if (!response.ok) {
		throw error(response.status, { message: response.statusText });
	}

	const contentLength = response.headers.get('Content-Length');
	if (contentLength === '0' || contentLength === null) {
		return undefined as T;
	}

	let data;
	try {
		console.log(response.bodyUsed);
		data = await response.json();
	} catch (error) {
		console.log();
	}

	return data as T;
};
