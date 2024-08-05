import { env } from '$env/dynamic/private';
import { APIError } from '$lib/server/APIError';
import { GET } from '$lib/server/GET';
import { Banner } from '../types/banner';

async function getBanner() {
	const banner = await GET<Banner>(`${env.API_URL}/api/banner`);
	if (banner instanceof APIError) {
		return null;
	}
	return banner;
}

export async function load({ locals }) {
	return {
		banner: await getBanner(),
		errorDuringLogin: locals.errorDuringLogin
	};
}
