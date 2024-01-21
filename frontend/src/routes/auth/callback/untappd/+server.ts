import { env } from '$env/dynamic/private';
import { GET as _GET } from '$lib/server/GET.js';
import { UNTAPPD_AUTH_CALLBACK_URL } from '../../../../constants.js';
import { createSession } from '$lib/server/session/createSession.js';
import { addUserToQueue } from '$lib/server/user/addUserToQueue.js';

export async function GET({ url, cookies }) {
	let errorDuringLogin = false;
	try {
		const code = url.searchParams.get('code');
		const token = await getAccessTokenFromCode(code);
		const { sessionCookie, sessionToken } = await createSession(token);
		await addUserToQueue(sessionToken);
		cookies.set('session-token', sessionToken.getValue(), {
			path: '/',
			expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
		});
		cookies.set('session-data', sessionCookie, { path: '/' });
	} catch (error) {
		console.trace(error);
		errorDuringLogin = true;
	}

	return new Response(null, {
		status: 302,
		headers: new Headers({ location: `/?login_error=${errorDuringLogin}` })
	});
}

async function getAccessTokenFromCode(code: string | null) {
	if (code === null) throw new Error('code is missing');

	const tokenUrl = `https://untappd.com/oauth/authorize/?client_id=${env.UNTAPPD_CLIENT_ID}&client_secret=${env.UNTAPPD_CLIENT_SECRET}&response_type=code&redirect_url=${UNTAPPD_AUTH_CALLBACK_URL}&code=${code}`;
	const { response } = await _GET<{ response: { access_token: string } }>(tokenUrl);
	return response.access_token;
}
