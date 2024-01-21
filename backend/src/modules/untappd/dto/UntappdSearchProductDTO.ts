export class UntappdSearchProductDTO {
	have_had: boolean;
	checkin_count: 0;
	your_count: 0;
	beer: {
		bid: number;
		beer_name: string;
		beer_label: string;
		beer_abv: number;
		beer_slug: string;
		beer_ibu: number;
		beer_description: string;
		created_at: string;
		beer_style: string;
		in_production: number;
		auth_rating: number;
		wish_list: boolean;
	};
	brewery: {
		brewery_id: number;
		brewery_name: string;
		brewery_slug: string;
		brewery_page_url: string;
		brewery_type: string;
		brewery_label: string;
		country_name: string;
		brewery_active: number;
	};
}
