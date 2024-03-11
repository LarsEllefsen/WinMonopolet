/* eslint-disable no-mixed-spaces-and-tabs */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VinmonopoletService } from '@modules/vinmonopolet/vinmonopolet.service';
import { IsNull, Like, Not, Repository } from 'typeorm';
import { UntappdProduct } from './entities/untappdProduct.entity';
import { VinmonopoletProduct } from './entities/vinmonopoletProduct.entity';
import { UntappdService } from '@modules/untappd/untappd.service';
import { APILimitReachedException } from '@exceptions/APILimitReachedException';
import { WordlistService } from '@modules/wordlist/wordlist.service';
import { productCategories } from '@common/constants';
import { Word } from '@modules/wordlist/entities/word';
import { ProductsStatCollector } from './productsStatCollector';
import { Store } from '@modules/stores/entities/stores.entity';
import { VinmonopoletProductWithStockLevel } from '@modules/vinmonopolet/vinmonopolet.interface';
import { Facet } from 'vinmonopolet-ts';
import { UpcomingProduct } from './entities/upcomingProduct.entity';

type ProcessVinmonopoletProducts = {
	apiLimitReached: boolean;
};

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(VinmonopoletProduct)
		private vinmonopoletProductRepository: Repository<VinmonopoletProduct>,
		@InjectRepository(UntappdProduct)
		private untappdProductRepository: Repository<UntappdProduct>,
		@InjectRepository(UpcomingProduct)
		private upcomingProductRepository: Repository<UpcomingProduct>,
		private vinmonopoletService: VinmonopoletService,
		private untappdService: UntappdService,
		private wordlistService: WordlistService,
	) {}

	private readonly logger = new Logger(ProductsService.name);
	private readonly DATE_PATTERN = new RegExp(
		'^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)[0-9]{2}$',
	);

	async getProducts(
		query?: string,
		hasUntappdProduct?: boolean,
		active?: boolean,
	): Promise<VinmonopoletProduct[]> {
		if (query)
			return this.searchProductsByQuery(query, hasUntappdProduct, active);

		const whereActiveClause = active !== undefined ? { active } : undefined;

		const whereHasUntappdProductClause =
			hasUntappdProduct !== undefined
				? {
						untappd: {
							untappd_id: hasUntappdProduct === true ? Not(IsNull()) : IsNull(),
						},
				  }
				: undefined;

		return this.vinmonopoletProductRepository.find({
			relations: { untappd: true },
			where: {
				...whereHasUntappdProductClause,
				...whereActiveClause,
			},
		});
	}

	private async searchProductsByQuery(
		query: string,
		hasUntappdProduct?: boolean,
		active?: boolean,
	) {
		const products = await this.vinmonopoletProductRepository.find({
			where: [
				{ vmp_name: Like(`%${query}%`), active },
				{ vmp_id: Like(`%${query}%`), active },
			],
			relations: {
				untappd: true,
			},
		});

		if (hasUntappdProduct === undefined) return products;
		return products.filter((product) =>
			hasUntappdProduct ? product !== null : product === null,
		);
	}

	async updateUntappdProductsWithScoreOfZero() {
		const untappdProductsToUpdate =
			await this.vinmonopoletProductRepository.findBy({
				untappd: {
					rating: 0.0,
				},
			});
		this.logger.debug(
			`Found ${untappdProductsToUpdate.length} products with a score of 0.0`,
		);
		for (const product of untappdProductsToUpdate) {
			await this.updateUntappdProduct(product);
		}
	}

	/**
	 * Updates untappd products by oldest LAST_UPDATED property.
	 */
	async updateOldestUntappdProducts() {
		let numUpdatedProducts = 0;
		try {
			const untappdProductsToUpdate =
				await this.vinmonopoletProductRepository.find({
					order: { untappd: { last_updated: 'asc' } },
					where: { untappd: { vmp_id: Not(IsNull()) }, active: true },
				});

			for (const product of untappdProductsToUpdate) {
				await this.updateUntappdProduct(product);
				numUpdatedProducts++;
			}
		} catch (error) {
			if (!(error instanceof APILimitReachedException)) {
				this.logger.error(
					`updateOldestUntappdProducts failed: ${
						(error?.message ?? error, error?.stack)
					}`,
				);
				throw error;
			}
		} finally {
			this.logger.log(
				`Successfully updated ${numUpdatedProducts} untappd products`,
			);
		}
	}

	async createUntappdProductForVinmonopoletProduct(
		vmp_id: string,
		untappd_id: string,
	) {
		const vinmonopoletProduct = await this.getProductById(vmp_id);
		if (vinmonopoletProduct === null)
			throw new NotFoundException(
				`No vinmonopol product with id ${vmp_id} found.`,
			);
		const untappdProduct = await this.untappdService.getUntappdProduct(
			untappd_id,
			vinmonopoletProduct.vmp_id,
		);
		await this.saveProduct(
			vinmonopoletProduct.withUntappdProduct(untappdProduct),
		);
	}

	async deleteUntappdProduct(vmp_id: string) {
		const vinmonopoletProduct = await this.getProductById(vmp_id);
		if (vinmonopoletProduct === null)
			throw new NotFoundException(
				`No vinmonopol product with id ${vmp_id} found.`,
			);
		if (!vinmonopoletProduct.untappd)
			throw new NotFoundException(
				`No untappd product associated with vinmonpol product ${vmp_id}`,
			);

		try {
			await this.vinmonopoletProductRepository
				.createQueryBuilder()
				.delete()
				.from(UntappdProduct)
				.where('untappd_id = :untappd_id', {
					untappd_id: vinmonopoletProduct.untappd.untappd_id,
				})
				.execute();
		} catch (error) {
			this.logger.error(
				`Unable to delete untappd product associated with product ${vinmonopoletProduct.vmp_name} (${vinmonopoletProduct.vmp_id}`,
			);
		}
		this.logger.log(
			`Successfully deleted untappd product ${vinmonopoletProduct.untappd.untappd_name} (${vinmonopoletProduct.untappd.untappd_id}) from product ${vinmonopoletProduct.vmp_name} (${vinmonopoletProduct.vmp_id})`,
		);
	}

	/**
	 * Gets all products in stock at the given vinmonopolet store.
	 * Processes every product before returning
	 */
	async getProductsByStore(store: Store) {
		let allProducts = [] as VinmonopoletProductWithStockLevel[];
		let getUntappdProducts = false;

		for (const productCategory of productCategories) {
			const products = await this.vinmonopoletService.getAllProductsByStore(
				store.store_id,
				productCategory,
			);

			const processProductsResult: ProcessVinmonopoletProducts =
				await this.processVinmonopoletProducts(
					products.map((x) => x.vinmonopoletProduct),
					getUntappdProducts,
				);

			allProducts = allProducts.concat(products);
			if (getUntappdProducts) {
				getUntappdProducts = !processProductsResult.apiLimitReached;
			}
		}

		return allProducts;
	}

	async findAndSaveAnyUpcomingProducts() {
		const statCollector = new ProductsStatCollector();
		let getUntappdProducts = true;

		for (const productCategory of productCategories) {
			const allUpcomingProducts = await this.vinmonopoletService.getAllProducts(
				[productCategory, Facet.UpcomingProduct],
			);

			const processResults: ProcessVinmonopoletProducts =
				await this.processVinmonopoletProducts(
					allUpcomingProducts,
					getUntappdProducts,
					statCollector,
				);
			if (getUntappdProducts) {
				getUntappdProducts = !processResults.apiLimitReached;
			}

			for (const product of allUpcomingProducts) {
				await this.saveUpcomingProduct(product);
			}
		}

		this.logger.log(
			`Found ${statCollector.getNumSavedProducts()} upcoming products`,
		);
	}

	/**
	 * Gets all products from Vinmonopolet and either updates the existing product or inserts it as a new product.
	 * If the product does not have a corresponding untappd product it tries to find a matching product and insert it into the database.
	 */
	async insertOrUpdateAllVinmonopoletProducts() {
		const statCollector = new ProductsStatCollector();
		let getUntappdProducts = true;

		for (const productCategory of productCategories) {
			this.logger.debug(
				`Fetching all products in category: ${productCategory}`,
			);
			const products = await this.vinmonopoletService.getAllProducts([
				productCategory,
			]);
			const processProductsResult: ProcessVinmonopoletProducts =
				await this.processVinmonopoletProducts(
					products,
					getUntappdProducts,
					statCollector,
				);
			if (getUntappdProducts) {
				getUntappdProducts = !processProductsResult.apiLimitReached;
			}
		}
		statCollector.printStatistics();
	}

	private async processVinmonopoletProducts(
		vinmonopoletProducts: VinmonopoletProduct[],
		getUntappdProducts: boolean,
		productsStatCollector: ProductsStatCollector | undefined = undefined,
	): Promise<ProcessVinmonopoletProducts> {
		const wordlist = await this.wordlistService.getAllWords();
		let apiLimitReached = false;
		for (const product of vinmonopoletProducts) {
			try {
				await this.saveProduct(product);
				productsStatCollector?.incrementSavedProducts();
				if (
					!apiLimitReached &&
					getUntappdProducts &&
					!(await this.vinmonopoletProductHasUntappdProduct(product))
				) {
					const untappdProduct = await this.tryToFindMatchingUntappdProduct(
						product,
						wordlist,
					);

					if (untappdProduct) {
						await this.saveProduct(product.withUntappdProduct(untappdProduct));
						productsStatCollector?.addFoundUntappdProduct(product);
					} else {
						productsStatCollector?.addDidNotFindUntappdProduct(product);
					}
				}
			} catch (exception) {
				if (exception instanceof APILimitReachedException) {
					this.logger.debug('API limit reached');
					apiLimitReached = true;
				} else {
					this.logger.error(
						`Failed to process product ${product.vmp_name} (${product.vmp_id})`,
						exception?.stack,
					);
				}
			}
		}
		return {
			apiLimitReached: apiLimitReached,
		} satisfies ProcessVinmonopoletProducts;
	}

	private vinmonopoletProductHasUntappdProduct(
		vinmonopoletProduct: VinmonopoletProduct,
	) {
		return this.untappdProductRepository.exist({
			where: { vmp_id: vinmonopoletProduct.vmp_id },
		});
	}

	private async tryToFindMatchingUntappdProduct(
		vinmonopoletProduct: VinmonopoletProduct,
		wordlist?: Word[],
	): Promise<UntappdProduct | undefined> {
		const matchingUntappdProduct =
			await this.untappdService.tryToFindMatchingUntappdProduct(
				vinmonopoletProduct,
				wordlist,
			);
		if (!matchingUntappdProduct)
			this.logger.debug(
				`Unable to find matching untappd product for product ${vinmonopoletProduct.vmp_name} (${vinmonopoletProduct.vmp_id})`,
			);
		else
			this.logger.debug(
				`Found matching untappd product for product ${vinmonopoletProduct.vmp_name} (${vinmonopoletProduct.vmp_id}): ${matchingUntappdProduct.untappd_name} (${matchingUntappdProduct.untappd_id})`,
			);

		return matchingUntappdProduct;
	}

	private async saveProduct(product: VinmonopoletProduct) {
		try {
			await this.vinmonopoletProductRepository.save(product);
		} catch (error) {
			this.logger.error(
				`Failed to save product ${product.vmp_name} (${product.vmp_id}) ${
					product.untappd
						? `with untappd product ${product.untappd?.untappd_id}  (${product.untappd?.untappd_id}).`
						: 'with no associated untappd product.'
				}`,
			);
			throw error;
		}
	}

	private async saveUpcomingProduct(product: VinmonopoletProduct) {
		const upcomingProduct = new UpcomingProduct();
		upcomingProduct.vinmonopoletProduct = product;
		upcomingProduct.releaseDate = this.getReleaseDate(product);
		await this.upcomingProductRepository.save(upcomingProduct);
	}

	private getProductById(vmp_id: string) {
		return this.vinmonopoletProductRepository.findOneBy({
			vmp_id: vmp_id,
		});
	}

	private async updateUntappdProduct(vinmonopoletProduct: VinmonopoletProduct) {
		try {
			if (!vinmonopoletProduct.untappd)
				throw Error(
					`Vinmonopolet product ${vinmonopoletProduct.vmp_name} does not have an associated untappd product`,
				);
			const updatedUntappdProduct = await this.untappdService.getUntappdProduct(
				vinmonopoletProduct.untappd.untappd_id,
				vinmonopoletProduct.vmp_id,
			);
			await this.saveProduct(
				vinmonopoletProduct.withUntappdProduct(updatedUntappdProduct),
			);
		} catch (error) {
			if (!(error instanceof APILimitReachedException))
				this.logger.error(
					`Unable to update untappd product ${
						vinmonopoletProduct.untappd?.untappd_id
					}:${error?.message ?? error}`,
					error?.stack,
				);
			throw error;
		}
	}

	private getReleaseDate(product: VinmonopoletProduct): Date {
		if (!product.availablity) {
			throw Error(
				`Unable to ascertain release date for product ${product.vmp_id}: missing availability information`,
			);
		}

		const splitAvailabilityText = product.availablity.split('Lanseres');
		if (splitAvailabilityText.length > 3) {
			throw Error(
				`Unable to ascertain release date for product ${product.vmp_id}: ambigious date in availability information (Found '${product.availablity}')`,
			);
		}

		const dateString =
			splitAvailabilityText.length == 2
				? splitAvailabilityText[1].trim()
				: splitAvailabilityText[0].trim();

		if (!this.DATE_PATTERN.test(dateString)) {
			throw Error(
				`Unable to ascertain release date for product ${product.vmp_id}: date string ${dateString} is not a valid date (Expected dd.mm.yyyy)`,
			);
		}

		const [day, month, year] = dateString.split('.');

		return new Date(Number(year), Number(month) - 1, Number(day));
	}
}
