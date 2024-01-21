import { deleteUser } from '$lib/server/user/deleteUser.js';
import { redirect } from '@sveltejs/kit';

export const DELETE = async ({ locals }) => {
	if (!locals.session.token) throw new Error('No authenticated user');

	await deleteUser(locals.session.token);

	throw redirect(303, '/');
};
