export class UntappdProduct {
	[key: string]: any;
	constructor(
		untappdProductId: string,
		vinmonopoletProductId: string,
		name: string,
		abv: number,
		rating: number,
		numRatings: number,
		untappdUrl: string,
		pictureUrl: string,
		style: string,
		brewery: string,
		lastUpdated?: Date,
	) {
		this.untappd_id = untappdProductId;
		this.vmp_id = vinmonopoletProductId;
		this.untappd_name = name;
		this.abv = abv;
		this.rating = rating;
		this.num_ratings = numRatings;
		this.untappd_url = untappdUrl;
		this.picture_url = pictureUrl;
		this.style = style;
		this.brewery = brewery;
		this.last_updated = lastUpdated;
	}

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

	last_updated?: Date;
}
