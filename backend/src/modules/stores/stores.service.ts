import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { Store } from './entities/stores.entity';
import { VinmonopoletService } from '@modules/vinmonopolet/vinmonopolet.service';
import { mapToStock } from './mapper';
import { productCategories } from '@common/constants';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { ProductsService } from '@modules/products/products.service';

@Injectable()
export class StoresService {
	constructor(
		@InjectRepository(Store)
		private storeRepository: Repository<Store>,

		@InjectRepository(Stock)
		private stockRepository: Repository<Stock>,

		@InjectRepository(VinmonopoletProduct)
		private productRepository: Repository<VinmonopoletProduct>,

		private vinmonopoletService: VinmonopoletService,

		private productsService: ProductsService,
	) {}

	private readonly logger = new Logger(StoresService.name);

	getAllStores() {
		return this.storeRepository.find();
	}

	getStockForStore(store: Store) {
		return this.stockRepository
			.createQueryBuilder('stock')
			.select(['stock.product', 'stock.stock_level', 'stock.last_updated'])
			.innerJoinAndSelect('stock.product', 'product')
			.innerJoinAndSelect('product.untappd', 'untappd')
			.where('stock.store_id = :store', { store: store.store_id })
			.orderBy('untappd.rating', 'DESC')
			.getMany();
	}

	async getStore(storeId: string) {
		const store = await this.storeRepository.findOneBy({ store_id: storeId });
		if (store === null) throw new NotFoundException('Store not found');

		return store;
	}

	async saveStock(stock: Stock) {
		await this.stockRepository.save(stock);
	}

	async updateStockForStore(store: Store) {
		try {
			this.logger.debug(
				`Updating stock for store ${store.name} (${store.store_id})`,
			);
			await this.stockRepository.manager.transaction(
				'SERIALIZABLE',
				async (manager) => {
					await manager
						.createQueryBuilder()
						.delete()
						.from(Stock, 'stock')
						.where('store_id = :store_id', { store_id: store.store_id })
						.execute();

					const productsInStock = await this.productsService.getProductsByStore(
						store,
					);

					for (const product of productsInStock) {
						const stock = mapToStock(store, product);
						try {
							await manager.save(stock);
						} catch (error) {
							this.logger.error(`Failed to save stock: ${stock}`);
							throw error;
						}
					}

					this.logger.debug('Finished updating store');
				},
			);
		} catch (error) {
			this.logger.error(
				`Failed to update stock for store ${store.store_id}: ${error?.message}`,
				error?.stack,
			);
			throw error;
		}
	}

	/**
	 * Updates stock for all stores.
	 *
	 * Note: As a side effect, this function will also update the ACTIVE property of all products.
	 * The only way for us to know that a product is active is whether it is in stock or not.
	 * To keep our information synced we need this side effect whenever we update the stock.
	 */
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
				await this.storeRepository.save(store);
			}

			for (const storeToRemove of storesToRemove) {
				await this.storeRepository.delete(storeToRemove);
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

	private async setActiveBeersBasedOnStock() {
		const uniqueProductsInStock: { vmp_id: string }[] =
			await this.stockRepository
				.createQueryBuilder()
				.select('vmp_id')
				.distinct(true)
				.getRawMany();

		const allProducts = await this.productRepository.find();

		await this.productRepository.manager.transaction(
			'SERIALIZABLE',
			async (manager) => {
				const queryBuilder = await manager.createQueryBuilder();
				for (const product of allProducts) {
					let active = 0;
					if (
						uniqueProductsInStock.some(
							(uniqueProductInStock) =>
								uniqueProductInStock.vmp_id === product.vmp_id,
						)
					) {
						active = 1;
					}
					await queryBuilder
						.update(VinmonopoletProduct)
						.set({ active })
						.where('vmp_id = :vmp_id', { vmp_id: product.vmp_id })
						.execute();
				}
			},
		);

		this.logger.log('Successfully updated active');
	}
}
