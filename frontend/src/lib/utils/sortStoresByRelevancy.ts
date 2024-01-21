import type { Store } from '../../types/store';

function levenshteinDistance(a: string, b: string): number {
	// Create a 2D array to store the distances
	const distances = new Array<Array<number>>(a.length + 1);
	for (let i = 0; i <= a.length; i++) {
		distances[i] = new Array<number>(b.length + 1);
	}

	// Initialize the first row and column
	for (let i = 0; i <= a.length; i++) {
		distances[i][0] = i;
	}
	for (let j = 0; j <= b.length; j++) {
		distances[0][j] = j;
	}

	// Fill in the rest of the array
	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			if (a[i - 1] === b[j - 1]) {
				distances[i][j] = distances[i - 1][j - 1];
			} else {
				distances[i][j] =
					Math.min(distances[i - 1][j], distances[i][j - 1], distances[i - 1][j - 1]) + 1;
			}
		}
	}

	// Return the final distance
	return distances[a.length][b.length];
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
	const radlat1 = (Math.PI * lat1) / 180;
	const radlat2 = (Math.PI * lat2) / 180;

	const theta = lon1 - lon2;
	const radtheta = (Math.PI * theta) / 180;

	let dist =
		Math.sin(radlat1) * Math.sin(radlat2) +
		Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = (dist * 180) / Math.PI;
	dist = dist * 60 * 1.1515;
	dist = dist * 1.609344;

	return dist;
};

const getDistanceToStore = (store: Store, currentGeolocationPosition: GeolocationCoordinates) => {
	return calculateDistance(
		currentGeolocationPosition.latitude,
		currentGeolocationPosition.longitude,
		parseFloat(store.lat),
		parseFloat(store.lon)
	);
};

const getStoresWithRelativeDistance = (
	geolocationPosition: GeolocationCoordinates,
	stores: Store[]
) => {
	return stores
		.map((store) => ({
			...store,
			...{ distanceTo: getDistanceToStore(store, geolocationPosition) }
		}))
		.sort((a, b) => (a.distanceTo < b.distanceTo ? -1 : 1));
};

export const sortStoresByRelevancy = (
	searchInput: string,
	stores: Store[],
	geolocationPosition?: GeolocationCoordinates | null
): Store[] => {
	if (geolocationPosition) return getStoresWithRelativeDistance(geolocationPosition, stores);

	if (!searchInput) return stores;

	return stores.sort(
		(a, b) => levenshteinDistance(a.name, searchInput) - levenshteinDistance(b.name, searchInput)
	);
};
