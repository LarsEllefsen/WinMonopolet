export type VinmonopoletProduct = {
	vmp_id: string;
	vmp_name: string;
	vmp_url: string;
	price: number;
	category: string;
	sub_category: string | null;
	product_selection: string;
	container_size: string;
	country: string;
	added_date: Date;
	last_updated: Date;
	active: number;
	is_new: boolean;
	untappd: UntappdProduct;
	has_had: boolean;
	user_score?: number;
};

export type UntappdProduct = {
	untappd_id: string;
	vmp_id: string;
	untappd_name: string;
	abv: number;
	rating: number;
	num_ratings: number;
	untappd_url: string;
	picture_url: string;
	style: string;
	brewery: string;
	last_updated: Date;
};

export type UserProduct = {
	userId: string;
	untappdId: string;
	userScore: number;
};

export enum ProductErrorType {
	WRONG_UNTAPPD = 'WRONG_UNTAPPD',
	WRONG_OR_MISSING_INFO = 'WRONG_OR_MISSING_INFO',
	OUTDATED_RATING = 'OUTDATED_RATING',
	OTHER = 'OTHER'
}

export type UpcomingProduct = {
	releaseDate: string;
	vinmonopoletProduct: VinmonopoletProduct;
};
