import { IsNotEmpty, ValidateNested } from 'class-validator';
import { UntappdProductDTO } from './UntappdProductDTO';
import { Type } from 'class-transformer';

export class GetBeerInfoResponseDTO {
	@IsNotEmpty()
	@ValidateNested()
	@Type(() => UntappdProductDTO)
	beer: UntappdProductDTO;
}
