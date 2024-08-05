import { getReleases } from '$lib/server/releases/getReleases';
import { SessionToken } from '$lib/server/session/sessionToken';
import { getStores } from '$lib/server/stores/getStores';
import { getFavoriteStores } from '$lib/server/user/favoriteStores/getFavoriteStores';
import { Store } from '../types/store';

const getStoresWithFavorites = async (stores: Store[], token: SessionToken) => {
	const userFavoriteStores = await getFavoriteStores(token);
	userFavoriteStores.forEach((favoriteStore) => {
		const store = stores.find((x) => x.store_id === favoriteStore.store_id);
		if (store) store.favorite = true;
	});
	return stores;
};

export async function load({ locals }) {
	let stores = await getStores();
	if (locals.session?.token) {
		stores = await getStoresWithFavorites(stores, locals.session.token);
	}

	return {
		stores,
		releases: await getReleases(),
		user: locals.session?.user,
		isAuthenticated: locals.session !== undefined ? true : false
	};
}
