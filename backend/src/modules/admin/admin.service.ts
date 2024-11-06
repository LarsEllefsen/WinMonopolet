import { BannerService } from '@modules/banner/banner.service';
import { BannerColor } from '@modules/banner/entities/banner.entity';
import { ProductsService } from '@modules/products/products.service';
import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { JobStatus, Queue } from 'bull';
import { Cache } from 'cache-manager';

@Injectable()
export class AdminService {
	private readonly logger = new Logger(AdminService.name);

	constructor(
		private readonly productsService: ProductsService,
		private readonly bannerService: BannerService,
		@InjectQueue('user') private userQueue: Queue,
		@Inject(CACHE_MANAGER) private cache: Cache,
	) {}

	async getUsersInQueueWithStatus(status: JobStatus) {
		const jobs = await this.getAllJobsWithStatus(status);
		return jobs;
	}

	async findAndSaveAnyUpcomingProducts() {
		this.logger.log(
			'Manually started scheduled task findAndSaveAnyUpcomingProducts ',
		);
		await this.productsService.findAndSaveAnyUpcomingProducts();
		await this.cache.reset();
	}

	saveAllVinmonopoletProducts() {
		this.logger.log(
			'Manually started scheduled task saveAllVinmonopoletProducts ',
		);
		this.productsService.saveAllVinmonopoletProducts();
	}

	async createBanner(text: string, color: BannerColor) {
		await this.bannerService.createBanner(text, color);
	}

	updateBanner(text: string, color: BannerColor) {
		return this.bannerService.updateBanner(text, color);
	}

	async deleteBanner() {
		await this.bannerService.deleteBanner();
	}

	private getAllJobsWithStatus(status: JobStatus) {
		switch (status) {
			case 'active':
				return this.userQueue.getActive();
			case 'delayed':
				return this.userQueue.getDelayed();
			case 'failed':
				return this.userQueue.getFailed();
			case 'completed':
				return this.userQueue.getCompleted();
			case 'waiting':
				return this.userQueue.getWaiting();
			default:
				return Promise.resolve([]);
		}
	}
}
