import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Store } from './entities/stores.entity';
import { ProductsService } from '@modules/products/products.service';
import { StoresRepository } from './repositories/stores.repository';
import { VinmonopoletService } from '@modules/vinmonopolet/vinmonopolet.service';

@Injectable()
export class StoresService {
	constructor(
		private vinmonopoletService: VinmonopoletService,
		private productsService: ProductsService,
		private storesRepository: StoresRepository,
	) {}

	private readonly logger = new Logger(StoresService.name);

	getAllStores() {
		return this.storesRepository.getAllStores();
	}

	getStockForStore(storeId: string) {
		return this.storesRepository.getStockForStore(storeId);
	}

	async getStore(storeId: string) {
		const store = await this.storesRepository.getStore(storeId);
		if (store === null) throw new NotFoundException('Store not found');

		return store;
	}

	async updateStockForStore(store: Store) {
		try {
			this.logger.debug(
				`Updating stock for store ${store.name} (${store.store_id})`,
			);

			const productsInStock = await this.productsService.getProductsByStore(
				store,
			);

			await this.storesRepository.updateStockForStore(
				productsInStock,
				store.store_id,
			);
		} catch (error) {
			this.logger.error(
				`Failed to update stock for store ${store.store_id}: ${error?.message}`,
				error?.stack,
			);
			throw error;
		}
	}

	async updateStockForAllStores() {
		const stores = await this.getAllStores();
		for (const store of stores) {
			try {
				await this.updateStockForStore(store);
				this.logger.debug(
					`Successfully updated stock for store ${store.name} (${store.store_id})`,
				);
			} catch (error) {
				this.logger.error(`Failed to update stock: ${error?.message}`);
			}
		}
	}

	async updateAvailableStores() {
		try {
			const allStores = await this.vinmonopoletService.getAllStores();
			const savedStores = await this.getAllStores();
			const storesToRemove = savedStores.filter(
				(store) => !allStores.find((x) => x.store_id === store.store_id),
			);
			for (const store of allStores) {
				await this.storesRepository.saveStore(store);
			}

			for (const storeToRemove of storesToRemove) {
				await this.storesRepository.deleteStore(storeToRemove.store_id);
				this.logger.log(
					`Removed store ${storeToRemove.name} (${storeToRemove.store_id})`,
				);
			}
		} catch (error) {
			this.logger.error(
				`Failed to upate available stores: ${error?.message ?? error}`,
				error?.stack,
			);
			throw error;
		}
	}
}
