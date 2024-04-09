import { Controller, Get, Param } from '@nestjs/common';
import { Stock } from './entities/stock.entity';
import { Store } from './entities/stores.entity';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
	constructor(private readonly storeService: StoresService) {}

	@Get()
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
