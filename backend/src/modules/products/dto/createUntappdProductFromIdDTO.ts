import { IsNotEmpty } from 'class-validator';

export class CreateUntappdProductFromIdDTO {
	@IsNotEmpty()
	untappd_id: string;
}
