import type { Handle, RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';
import { refreshSession } from '$lib/server/session/refreshSession';
import { SessionToken } from '$lib/server/session/sessionToken';
import type { User } from './types/user';

const handleExpectedErrors: Handle = async ({ event, resolve }) => {
	if (event.route.id === '/') {
		const errorDuringLogin = event.url.searchParams.get('login_error');
		if (errorDuringLogin !== null) {
			event.locals.errorDuringLogin = errorDuringLogin.toLowerCase() === 'true';
		}
	}

	return resolve(event);
};

const eventWithSessionDataFromServer = async (
	event: RequestEvent<Partial<Record<string, string>>, string | null>
) => {
	if (!event.locals.session.token)
		throw new Error('Unable to get user info: No SessionToken found');

	const sessionToken = event.locals.session.token;
	console.log({ route: event.route });
	const { user, sessionCookie } = await refreshSession(sessionToken);
	event.locals.session = { user, token: sessionToken };
	event.cookies.set('session-data', sessionCookie, { path: '/' });
	return event;
};

const eventWithSessionDataFromCookie = (
	sessionCookie: string,
	event: RequestEvent<Partial<Record<string, string>>, string | null>
) => {
	const userInfo = jwt.verify(sessionCookie, env.JWT_SECRET) as User;
	event.locals.session = { user: userInfo, token: event.locals.session.token };

	return event;
};

const getEventWithUserInfo = async (
	event: RequestEvent<Partial<Record<string, string>>, string | null>
) => {
	const sessionDataCookie = event.cookies.get('session-data');
	if (sessionDataCookie) return eventWithSessionDataFromCookie(sessionDataCookie, event);

	return eventWithSessionDataFromServer(event);
};

const authorization: Handle = async ({ event, resolve }) => {
	console.time('authorization');
	try {
		const sessionTokenCookie = event.cookies.get('session-token');
		if (sessionTokenCookie) {
			event.locals.session = { token: SessionToken.fromCookie(sessionTokenCookie) };
			event = await getEventWithUserInfo(event);
		}
	} catch (error) {
		console.trace(error);
		event.locals.errorDuringLogin = true;
	}
	console.timeEnd('authorization');
	return resolve(event);
};

export const handle = sequence(handleExpectedErrors, authorization);
