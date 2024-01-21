import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
	cookies.delete('session-token');
	cookies.delete('session-data');

	throw redirect(302, '/');
}
