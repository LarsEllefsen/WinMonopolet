import type { Store } from '../../types/store';

const filterStoresBySearchInput = (
	searchInput: string,
	stores: Store[],
	stripSpecialCharacters = true
) => {
	return stores.filter((store) => {
		const storeName = stripSpecialCharacters
			? store.name.replace(new RegExp(/[^a-åA-Å ]/, 'i'), '')
			: store.name;
		return storeName.toUpperCase().includes(searchInput.toUpperCase());
	});
};

export const searchStores = (searchInput: string, stores: Store[]) => {
	if (!searchInput) {
		return stores;
	}
	let storesMatchingSearchInput = filterStoresBySearchInput(searchInput, stores);
	if (storesMatchingSearchInput.length === 0)
		storesMatchingSearchInput = filterStoresBySearchInput(searchInput, stores, false);

	return storesMatchingSearchInput;
};
