import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import { UNTAPPD_AUTH_CALLBACK_URL } from '../../constants';

export async function load() {
	throw redirect(
		303,
		`https://untappd.com/oauth/authenticate/?client_id=${env.UNTAPPD_CLIENT_ID}&response_type=code&redirect_url=${UNTAPPD_AUTH_CALLBACK_URL}`
	);
}
