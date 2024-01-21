import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWordDTO {
	@IsNotEmpty()
	@IsString()
	word: string;
}
