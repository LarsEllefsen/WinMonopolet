import { IsNotEmpty, IsNumber } from 'class-validator';
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
