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
	private async updateProductsRoutine() {
		if (process.env.NODE_ENV === 'development') return;

		this.logger.log('Starting update routine');

		await this.runCatching(
			() => this.productService.saveAllVinmonopoletProducts(),
			'saveAllVinmonopoletProducts',
		);
		await this.runCatching(
			() => this.productService.updateOldestUntappdProducts(),
			'updateOldestUntappdProducts',
		);
		await this.cache.reset();
	}

	/**
	 * Offset 3 hours from updateRoutine so the two jobs never hit
	 * Will run at:
	 * 03:00 (UTC) - 04:00 Europe/Oslo
	 * 09:00 (UTC) - 10:00 Europe/Oslo
	 * 15:00 (UTC) - 16:00 Europe/Oslo
	 * 21:00 (UTC) - 22:00 Europe/Oslo
	 */
	@Cron('0 3,9,15,21 * * *')
	private async updateStoresRoutine() {
		if (process.env.NODE_ENV === 'development') return;

		this.logger.log('Starting update stores routine');

		await this.runCatching(
			() => this.storesService.updateAvailableStores(),
			'updateAvailableStores',
		);
		await this.runCatching(
			() => this.storesService.updateStockForAllStores(),
			'updateStockForAllStores',
		);
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

	private async runCatching<T>(fn: () => Promise<T>, name: string) {
		try {
			return await fn();
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`${name} failed: ${error.message}`, error.stack);
				return;
			}
			this.logger.error(`${name} failed: ${error}`);
		}
	}
}
