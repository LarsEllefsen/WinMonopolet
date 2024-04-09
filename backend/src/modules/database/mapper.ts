import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import {
	UntappdProductRow,
	VinmonopoletProductRow,
} from '../products/repositories/products.repository';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { StockRow } from '../stores/repositories/stores.repository';
import { Stock } from '@modules/stores/entities/stock.entity';

export function mapRowToUntappdProduct(
	row: UntappdProductRow,
): UntappdProduct | undefined {
	if (!row.untappd_id) return undefined;
	return new UntappdProduct(
		row.untappd_id,
		row.vmp_id,
		row.untappd_name,
		row.abv,
		row.rating,
		row.num_ratings,
		row.untappd_url,
		row.picture_url,
		row.style,
		row.brewery,
		new Date(row.last_updated),
	);
}

export function mapRowToVinmonopoletProduct(
	row: VinmonopoletProductRow & UntappdProductRow & { release_date?: string },
) {
	const vinmonopoletProduct = new VinmonopoletProduct(
		row.vmp_id,
		row.vmp_name,
		row.vmp_url,
		row.price,
		row.category,
		row.sub_category,
		row.product_selection,
		row.container_size,
		row.country,
		new Date(row.added_date),
		new Date(row.last_updated),
		row.active,
		row.buyable,
		row.release_date === undefined
			? null
			: mapReleaseDateToAvailabilityText(row.release_date),
		mapRowToUntappdProduct(row),
	);

	return vinmonopoletProduct;
}

function mapReleaseDateToAvailabilityText(releaseDate: string) {
	const date = new Date(releaseDate);
	const options: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	};

	return `Lanseres ${date.toLocaleDateString('nb-NO', options)}`;
}

export function mapRowToStock(
	row: StockRow & VinmonopoletProductRow & UntappdProductRow,
) {
	return new Stock(
		row.store_id,
		mapRowToVinmonopoletProduct(row),
		row.stock_level,
		new Date(row.last_updated),
	);
}
