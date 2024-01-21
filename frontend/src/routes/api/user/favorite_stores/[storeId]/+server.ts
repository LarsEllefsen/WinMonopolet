import { deleteFavoriteStore } from '$lib/server/user/favoriteStores/deleteFavoriteStore.js';

export async function DELETE({ locals, params }) {
	const storeId = params.storeId;
	if (!locals.session.token) throw new Error('No authenticated user');

	await deleteFavoriteStore(storeId, locals.session.token);

	return new Response(null, { status: 204 });
}
