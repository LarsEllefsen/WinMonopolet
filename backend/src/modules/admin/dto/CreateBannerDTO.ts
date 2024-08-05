import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { BannerColor } from '@modules/banner/entities/banner.entity';

export class CreateBannerDTO {
	@IsNotEmpty()
	@IsString()
	text: string;

	@IsNotEmpty()
	@IsIn(Object.values(BannerColor))
	color: BannerColor;
}
