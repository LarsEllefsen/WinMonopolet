import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { Injectable, Logger } from '@nestjs/common';
import {
	BaseProduct,
	FacetValue,
	getAllStores,
	getProducts,
	getProductsByStore,
	getProduct,
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

	async getAllProducts(facet: FacetValue) {
		const allProducts: VinmonopoletProduct[] = [];
		let currentPage = 1;
		let totalPages = 2;
		while (currentPage <= totalPages) {
			const { pagination, products } = await getProducts({
				facet,
				page: currentPage,
			});

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
			const { pagination, products } = await delayExecution(
				() =>
					getProductsByStore(storeId, {
						facet,
						page: currentPage,
					}),
				rateLimiting ? 1000 : 0,
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
		const stores = await getAllStores();
		return stores.map((store) => {
			const mappedStore = mapToStore(store);
			return this.validateStore(mappedStore);
		});
	}

	private async validateProduct(baseProduct: BaseProduct) {
		const validationErrors = await validate(baseProduct);
		if (validationErrors.length > 0) {
			throw new Error(
				'Validation of vinmonopolet baseProduct failed: ' + validationErrors,
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

	async healthcheck() {
		return getProduct('14962801');
	}
}
