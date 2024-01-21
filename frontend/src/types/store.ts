export type Store = {
	name: string;
	store_id: string;
	lon: string;
	lat: string;
	address: string;
	distanceTo?: number;
	favorite: boolean;
};

export type FavoriteStore = {
	store_id: string;
	user_id: string;
};
