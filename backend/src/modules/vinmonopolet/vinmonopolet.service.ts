import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { Injectable, Logger } from '@nestjs/common';
import {
	BaseProduct,
	FacetValue,
	getAllStores,
	getProducts,
	getProductsByStore,
	VinmonopoletError,
} from 'vinmonopolet-ts';
import { VinmonopoletProductWithStockLevel } from './vinmonopolet.interface';
import {
	mapToStore,
	mapToVinmonopoletProduct,
	mapToVinmonopoletProductWithStockLevel,
} from './mapper';
import { validate, validateSync } from 'class-validator';
import { delayExecution } from '@utils/delayExecution';
import { Store } from '@modules/stores/entities/stores.entity';

@Injectable()
export class VinmonopoletService {
	private readonly logger = new Logger(VinmonopoletService.name);
	private readonly requestDelayMs = Number(
		process.env.VINMONOPOLET_REQUEST_DELAY_MS ?? 1200,
	);

	async getAllProducts(facets: FacetValue[], rateLimiting = true) {
		const allProducts: VinmonopoletProduct[] = [];
		let currentPage = 1;
		let totalPages = 2;
		while (currentPage <= totalPages) {
			const { pagination, products } = await this.callApi(
				() => getProducts({ facets, page: currentPage }),
				rateLimiting,
				'getProducts',
			);

			for (const product of products) {
				await this.validateProduct(product);
				allProducts.push(mapToVinmonopoletProduct(product));
			}

			totalPages = pagination.totalPages;
			currentPage++;
		}

		return allProducts;
	}

	async getAllProductsByStore(
		storeId: string,
		facet: FacetValue,
		rateLimiting = true,
	): Promise<VinmonopoletProductWithStockLevel[]> {
		let allProducts: VinmonopoletProductWithStockLevel[] = [];
		let currentPage = 1;
		let totalPages = 2;
		while (currentPage <= totalPages) {
			const { pagination, products } = await this.callApi(
				() =>
					getProductsByStore(storeId, {
						facet,
						page: currentPage,
					}),
				rateLimiting,
				'getProductsByStore',
			);
			allProducts = allProducts.concat(
				products.map(mapToVinmonopoletProductWithStockLevel),
			);

			totalPages = pagination.totalPages;
			currentPage++;
		}

		return allProducts;
	}

	async getAllStores() {
		const stores = await this.callApi(() => getAllStores(), true, 'getAllStores');
		return stores.map((store) => {
			const mappedStore = mapToStore(store);
			return this.validateStore(mappedStore);
		});
	}

	private async callApi<T>(
		fn: () => Promise<T>,
		rateLimitingEnabled = true,
		name = fn.name,
	) {
		try {
			return await delayExecution<T>(
				() => fn(),
				rateLimitingEnabled ? this.requestDelayMs : 0,
			);
		} catch (error) {
			if (error instanceof VinmonopoletError) {
				this.logger.error(
					`${name} failed with status ${error.status}: ${error.message}`,
				);
				throw error;
			}
			if (error instanceof Error) {
				this.logger.error(`${name} failed: ${error.message}`);
				throw error;
			}

			this.logger.error(`${name} failed: ${error}`);
			throw error;
		}
	}

	private async validateProduct(baseProduct: BaseProduct) {
		const validationErrors = await validate(baseProduct);
		if (validationErrors.length > 0) {
			throw new Error(
				`Validation of vinmonopolet baseProduct ${baseProduct.code} (${baseProduct.name}) failed: ${validationErrors}`,
			);
		}
	}

	private validateStore(store: Store) {
		const validationErrors = validateSync(store);
		if (validationErrors.length > 0) {
			throw new Error(
				'Validation of vinmonopolet store failed: ' + validationErrors,
			);
		}
		return store;
	}
}
