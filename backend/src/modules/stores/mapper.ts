import { Stock } from './entities/stock.entity';
import { VinmonopoletProductWithStockLevel } from '@modules/vinmonopolet/vinmonopolet.interface';
import { Store } from './entities/stores.entity';

export const mapToStock = (
	store: Store,
	{ vinmonopoletProduct, stockLevel }: VinmonopoletProductWithStockLevel,
) => {
	const stock = new Stock();
	stock.last_updated = new Date();
	stock.product = vinmonopoletProduct;
	stock.store = store;
	stock.stock_level = stockLevel;

	return stock;
};
