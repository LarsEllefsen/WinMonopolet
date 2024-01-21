import type { VinmonopoletProduct } from './product';

export type Stock = {
	product: VinmonopoletProduct;
	stock_level: number;
	last_updated: string;
};
