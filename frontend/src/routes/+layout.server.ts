import { getReleases } from '$lib/server/releases/getReleases';
import { getStores } from '$lib/server/stores/getStores';

export async function load({ locals }) {
	return {
		stores: getStores(),
		releases: getReleases(),
		user: locals.session?.user,
		isAuthenticated: locals.session !== undefined ? true : false
	};
}
