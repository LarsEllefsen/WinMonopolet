import { ProductsService } from '@modules/products/products.service';
import { StoresService } from '@modules/stores/stores.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cache } from 'cache-manager';

@Injectable()
export class SchedulerService {
	constructor(
		private storesService: StoresService,
		private productService: ProductsService,
		@Inject(CACHE_MANAGER) private cache: Cache,
	) {}

	private readonly logger = new Logger(SchedulerService.name);

	/**
	 * Will run at:
	 * 00:00 (UTC) - 01:00 Europe/Oslo
	 * 06:00 (UTC) - 07:00 Europe/Oslo
	 * 12:00 (UTC) - 13:00 Europe/Oslo
	 * 18:00 (UTC) - 19:00 Europe/Oslo
	 */
	@Cron(CronExpression.EVERY_6_HOURS)
	private async updateRoutine() {
		if (process.env.NODE_ENV === 'development') return;
		this.logger.log('Starting update routine');
		await this.productService.insertOrUpdateAllVinmonopoletProducts();
		await this.storesService.updateAvailableStores();
		await this.storesService.updateStockForAllStores();
		await this.productService.updateOldestUntappdProducts();
		await this.cache.reset();
	}

	/**
	 * Will run at (UTC):
	 * 04:00 (UTC) - 5:00 Europe/Oslo
	 */
	@Cron(CronExpression.EVERY_DAY_AT_4AM)
	private async updateUntappdProductsWithScoreOfZero() {
		if (process.env.NODE_ENV === 'development') return;
		this.logger.log(
			'Starting scheduled task: updateUntappdProductsWithScoreOfZero',
		);
		await this.productService.updateUntappdProductsWithScoreOfZero();
	}

	@Cron(CronExpression.EVERY_DAY_AT_9AM)
	private async findAndSaveAnyUpcomingProducts() {
		if (process.env.NODE_ENV === 'development') return;
		this.logger.log('Starting scheduled task: findAndSaveAnyUpcomingProducts');
		await this.productService.findAndSaveAnyUpcomingProducts();
		await this.cache.reset();
	}
}
