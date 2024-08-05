import { Inject, Injectable } from '@nestjs/common';
import { BannerRepository } from './repositories/banner.repository';
import { BannerColor } from './entities/banner.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class BannerService {
	constructor(
		private readonly bannerRepository: BannerRepository,
		@Inject(CACHE_MANAGER) private cache: Cache,
	) {}

	async createBanner(text: string, color: BannerColor) {
		await this.bannerRepository.createBanner(text, color);
		await this.cache.del('banner');
	}

	async updateBanner(text: string, color: BannerColor) {
		const updatedBanner = await this.bannerRepository.updateBanner(text, color);
		await this.cache.del('banner');

		return updatedBanner;
	}

	getBanner() {
		return this.bannerRepository.getBanner();
	}

	async deleteBanner() {
		await this.bannerRepository.deleteBanner();
		await this.cache.del('banner');
	}
}
