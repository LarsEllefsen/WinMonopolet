import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { IsNumber } from 'class-validator';
import { FacetValue } from 'vinmonopolet-ts';

export interface GetAllProducts {
	limit?: number;
	page: number;
	facet?: FacetValue;
}

export class VinmonopoletProductDTO {
	/**
	 * Unique ID for the product.
	 */
	code: string;
	/**
	 * The product name
	 */
	name: string;
	/**
	 * The product type (Øl, Mjød, Hvitvin etc)
	 */
	productType: string;
	/**
	 * The url to the vinmonopol.no product page
	 */
	url: string;
	/**
	 * The product price
	 */
	@IsNumber()
	price: number;
	/**
	 * The product price per liter
	 */
}

export type VinmonopoletProductWithStockLevel = {
	stockLevel: number;
	vinmonopoletProduct: VinmonopoletProduct;
};
