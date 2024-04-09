import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';

export class Stock {
	constructor(
		storeId: string,
		product: VinmonopoletProduct,
		stockLevel: number,
		lastUpdated?: Date,
	) {
		this.storeId = storeId;
		this.product = product;
		this.stock_level = stockLevel;
		this.last_updated = lastUpdated;
	}
	storeId: string;

	product: VinmonopoletProduct;

	stock_level: number;

	last_updated?: Date;

	toString() {
		return `
		{ 
			store: ${this.storeId},
			product: ${this.product.vmp_name} (${this.product.vmp_id}),
			stock_level: ${this.stock_level}
		}`;
	}
}
