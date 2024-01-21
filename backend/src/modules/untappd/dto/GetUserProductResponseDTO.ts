import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UntappdUserProductDTO } from './UntappdUserProductDTO';

export class GetUserProductResponseDTO {
	@IsNotEmpty()
	@IsNumber()
	total_count: number;

	@IsNotEmpty()
	@IsString()
	sort_key: string;

	pagination: {
		offset?: number;
	};

	beers: {
		count: number;
		items: UntappdUserProductDTO[];
	};
}
