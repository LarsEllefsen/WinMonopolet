import { Type } from 'class-transformer';
import {
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';

class UntappdBreweryDTO {
	@IsNotEmpty()
	@IsNumber()
	brewery_id: number;

	@IsNotEmpty()
	@IsString()
	brewery_name: string;

	@IsNotEmpty()
	@IsString()
	brewery_slug: string;

	@IsNotEmpty()
	@IsString()
	brewery_page_url: string;

	@IsNotEmpty()
	@IsString()
	brewery_type: string;

	@IsNotEmpty()
	@IsString()
	brewery_label: string;

	@IsNotEmpty()
	@IsString()
	country_name: string;

	@IsOptional()
	@IsNumber()
	brewery_active: number;
}

export class UntappdProductDTO {
	@IsNotEmpty()
	@IsNumber()
	bid: number;

	@IsNotEmpty()
	@IsString()
	beer_name: string;

	@IsNotEmpty()
	@IsString()
	beer_label: string;

	@IsNotEmpty()
	@IsNumber()
	beer_abv: number;

	@IsNotEmpty()
	@IsString()
	beer_slug: string;
	beer_ibu: number;

	@IsOptional()
	@IsString()
	beer_description: string;

	@IsNotEmpty()
	@IsString()
	created_at: string;

	@IsNotEmpty()
	@IsString()
	beer_style: string;

	@IsOptional()
	@IsNumber()
	in_production: number;

	@IsNotEmpty()
	@IsNumber()
	auth_rating: number;
	wish_list: boolean;

	@IsNotEmpty()
	@IsNumber()
	rating_count: number;

	@IsNotEmpty()
	@IsNumber()
	rating_score: number;

	@IsNotEmpty()
	@ValidateNested()
	@Type(() => UntappdBreweryDTO)
	brewery: UntappdBreweryDTO;
}
