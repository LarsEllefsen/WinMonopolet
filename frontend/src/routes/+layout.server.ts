import { GET } from '$lib/server/GET';
import type { SessionToken } from '$lib/server/session/sessionToken';
import { getFavoriteStores } from '$lib/server/user/favoriteStores/getFavoriteStores';
import { env } from '$env/dynamic/private';
import type { Store } from '../types/store';
import type { Releases, ReleasesDTO } from '../types/releases';

const getStoresWithFavorites = async (stores: Store[], token: SessionToken) => {
	const userFavoriteStores = await getFavoriteStores(token);
	userFavoriteStores.forEach((favoriteStore) => {
		const store = stores.find((x) => x.store_id === favoriteStore.store_id);
		if (store) store.favorite = true;
	});
	return stores;
};

const getStores = async (sessionToken?: SessionToken) => {
	let stores = await GET<Store[]>(`${env.API_URL}/api/stores`);
	if (sessionToken) {
		stores = await getStoresWithFavorites(stores, sessionToken);
	}

	return stores;
};

const getReleases = async () => {
	const releasesDTO = await GET<ReleasesDTO>(`${env.API_URL}/api/releases`);

	return {
		upcomingReleases: releasesDTO.upcomingReleases.map((x) => new Date(x)),
		previousReleases: releasesDTO.previousReleases.map((x) => new Date(x))
	} satisfies Releases;
};

export async function load({ locals }) {
	const stores = await getStores(locals.session?.token);
	const releases = await getReleases();
	return {
		stores,
		releases,
		user: locals.session?.user,
		isAuthenticated: locals.session !== undefined ? true : false
	};
}
