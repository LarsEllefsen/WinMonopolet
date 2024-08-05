import {
	CacheKey,
	Controller,
	Get,
	NotFoundException,
	UseInterceptors,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { SIX_HOURS_IN_MILLISECONDS } from '@common/constants';

@Controller('banner')
export class BannerController {
	constructor(private readonly bannerService: BannerService) {}

	@Get()
	@UseInterceptors(CacheInterceptor)
	@CacheTTL(SIX_HOURS_IN_MILLISECONDS)
	@CacheKey('banner')
	async getBanner() {
		const banner = await this.bannerService.getBanner();
		if (banner === null) {
			throw new NotFoundException('No banner found');
		}

		return banner;
	}
}
