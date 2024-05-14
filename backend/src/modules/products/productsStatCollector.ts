import { Logger } from '@nestjs/common';
import { VinmonopoletProduct } from './entities/vinmonopoletProduct.entity';
import { UntappdProduct } from './entities/untappdProduct.entity';

export class ProductsStatCollector {
	private numSavedProducts: number;
	private foundUntappdProduct: VinmonopoletProduct[] = [];
	private didNotFindUntappdProduct: VinmonopoletProduct[] = [];

	private readonly logger = new Logger(ProductsStatCollector.name);

	constructor() {
		this.numSavedProducts = 0;
		this.foundUntappdProduct = [];
		this.didNotFindUntappdProduct = [];
	}

	incrementSavedProducts() {
		this.numSavedProducts++;
	}

	addFoundUntappdProduct(
		product: VinmonopoletProduct,
		untappdProduct: UntappdProduct,
	) {
		product.untappd = untappdProduct;
		this.foundUntappdProduct.push(product);
	}

	addDidNotFindUntappdProduct(product: VinmonopoletProduct) {
		this.didNotFindUntappdProduct.push(product);
	}

	getNumSavedProducts() {
		return this.numSavedProducts;
	}

	printStatistics() {
		this.logger.log(`
Successfully saved ${this.numSavedProducts} products.

${this.getFoundNewUntappdProductStats()}
${this.getDidNotFindUntappdProductStats()}

        `);
	}

	private getFoundNewUntappdProductStats() {
		if (this.foundUntappdProduct.length === 0)
			return 'Found no new unntapd products';

		return `Found ${
			this.foundUntappdProduct.length
		} new untappd products: \n ${this.foundUntappdProduct
			.map(this.getFoundNewUntappdProductInfo)
			.join('\n')}
        `;
	}

	private getDidNotFindUntappdProductStats() {
		if (this.didNotFindUntappdProduct.length === 0)
			return 'All products have an associated untappd product!';

		return `Unable to find untappd product for ${
			this.didNotFindUntappdProduct.length
		} products: \n ${this.didNotFindUntappdProduct
			.map(this.getDidNotFindUntappdProductInfo)
			.join('\n')}
        `;
	}

	private getFoundNewUntappdProductInfo(
		product: VinmonopoletProduct,
		index: number,
	) {
		return `\t[${index + 1}] ${product.vmp_name} (${product.vmp_id}): ${
			product.untappd?.untappd_name
		} (${product.untappd?.untappd_id})`;
	}

	private getDidNotFindUntappdProductInfo(
		product: VinmonopoletProduct,
		index: number,
	) {
		return `\t[${index + 1}] ${product.vmp_name} (${product.vmp_id})`;
	}
}
