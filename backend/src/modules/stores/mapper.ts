import { Stock } from './entities/stock.entity';
import { VinmonopoletProductWithStockLevel } from '@modules/vinmonopolet/vinmonopolet.interface';
import { Store } from './entities/stores.entity';

export const mapToStock = (
	store: Store,
	{ vinmonopoletProduct, stockLevel }: VinmonopoletProductWithStockLevel,
) => {
	const stock = new Stock(store.store_id, vinmonopoletProduct, stockLevel);
	stock.last_updated = new Date();
	stock.product = vinmonopoletProduct;
	stock.storeId = store.store_id;
	stock.stock_level = stockLevel;

	return stock;
};
