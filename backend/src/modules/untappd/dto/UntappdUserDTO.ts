import { IsNumber, IsString } from 'class-validator';

export class UntappdUserDTO {
	@IsNumber()
	id: number;

	@IsString()
	user_name: string;

	@IsString()
	first_name: string;

	@IsString()
	last_name: string;

	@IsString()
	user_avatar: string;

	@IsString()
	user_avatar_hd: string;

	stats: {
		total_beers: number;
	};
}
