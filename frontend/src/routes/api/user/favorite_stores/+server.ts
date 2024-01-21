import { addFavoriteStore } from '$lib/server/user/favoriteStores/addFavoriteStore.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const { storeId } = await request.json();
	if (!locals.session.token) throw new Error('No authenticated user');

	await addFavoriteStore(storeId, locals.session.token);

	return new Response(null, { status: 204 });
}
