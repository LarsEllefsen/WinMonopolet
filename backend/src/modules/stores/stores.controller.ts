import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { Stock } from './entities/stock.entity';
import { Store } from './entities/stores.entity';
import { StoresService } from './stores.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { SIX_HOURS_IN_MILLISECONDS } from '@common/constants';

@Controller('stores')
export class StoresController {
	constructor(private readonly storeService: StoresService) {}

	@Get()
	@CacheTTL(SIX_HOURS_IN_MILLISECONDS)
	@UseInterceptors(CacheInterceptor)
	getAllStores(): Promise<Store[]> {
		return this.storeService.getAllStores();
	}

	@Get('/:store_id/products')
	async getAllProductsByStore(
		@Param('store_id') storeId: string,
	): Promise<Stock[]> {
		return this.storeService.getStockForStore(storeId);
	}
}
