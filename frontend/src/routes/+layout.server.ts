import { GET } from '$lib/server/GET';
import type { SessionToken } from '$lib/server/session/sessionToken';
import { getFavoriteStores } from '$lib/server/user/favoriteStores/getFavoriteStores';
import { env } from '$env/dynamic/private';
import type { Store } from '../types/store';

const getStoresWithFavorites = async (stores: Store[], token: SessionToken) => {
	const userFavoriteStores = await getFavoriteStores(token);
	userFavoriteStores.forEach((favoriteStore) => {
		const store = stores.find((x) => x.store_id === favoriteStore.store_id);
		if (store) store.favorite = true;
	});
	return stores;
};

export async function load({ locals }) {
	let stores = await GET<Store[]>(`${env.API_URL}/api/stores`);
	if (locals.session?.token) {
		stores = await getStoresWithFavorites(stores, locals.session.token);
	}
	return {
		stores,
		user: locals.session?.user,
		isAuthenticated: locals.session !== undefined ? true : false
	};
}
