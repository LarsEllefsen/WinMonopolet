import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UntappdUserProductDTO } from './UntappdUserProductDTO';
import { UntappdUserWishlistProductDTO } from './UntappdUserWishlistProductDTO';

export class GetUserWishlistProductResponseDTO {
	@IsNotEmpty()
	@IsNumber()
	total_count: number;

	beers: {
		count: number;
		items: UntappdUserWishlistProductDTO[];
	};
}
