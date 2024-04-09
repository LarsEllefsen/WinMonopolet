import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Store } from '../entities/stores.entity';
import { CONNECTION_POOL } from '@modules/database/database.module';
import { Stock } from '../entities/stock.entity';
import { VinmonopoletProductWithStockLevel } from '@modules/vinmonopolet/vinmonopolet.interface';
import {
	UntappdProductRow,
	VinmonopoletProductRow,
} from '@modules/products/repositories/products.repository';
import { mapRowToVinmonopoletProduct } from '@modules/database/mapper';

export type StoresRow = {
	store_id: string;
	name: string;
	formatted_name: string;
	category: number;
	address: string;
	city: string;
	zip: string;
	lon: string;
	lat: string;
};

export type StockRow = {
	store_id: string;
	vmp_id: string;
	stock_level: number;
	last_updated: string;
};

@Injectable()
export class StoresRepository {
	constructor(@Inject(CONNECTION_POOL) private connectionPool: Pool) {}

	public async getAllStores() {
		const stores = await this.connectionPool.query<StoresRow>(
			'SELECT * FROM stores',
		);

		return stores.rows.map(this.mapToStore);
	}

	public async getStore(storeId: string): Promise<Store | null> {
		const stock = await this.connectionPool.query<StoresRow>(
			'SELECT * FROM stores WHERE store_id = $1',
			[storeId],
		);

		if (stock.rowCount === 0) return null;

		return this.mapToStore(stock.rows[0]);
	}

	public async updateStockForStore(
		products: VinmonopoletProductWithStockLevel[],
		storeId: string,
	) {
		const client = await this.connectionPool.connect();

		try {
			await client.query('BEGIN');
			await client.query('DELETE FROM stock WHERE store_id = $1', [storeId]);
			for (const { vinmonopoletProduct, stockLevel } of products) {
				await client.query(
					`INSERT INTO stock (store_id, vmp_id, stock_level) 
                    VALUES ($1, $2, $3) 
                    ON CONFLICT(store_id, vmp_id) DO UPDATE SET stock_level = $3`,
					[storeId, vinmonopoletProduct.vmp_id, stockLevel],
				);
			}
			await client.query('COMMIT');
		} catch (error) {
			await client.query('ROLLBACK');
			throw error;
		} finally {
			client.release();
		}
	}

	public async getStockForStore(storeId: string): Promise<Stock[]> {
		const stock = await this.connectionPool.query<
			StockRow & VinmonopoletProductRow & UntappdProductRow
		>(
			`SELECT *, true AS active FROM stock s 
            INNER JOIN vinmonopolet_products vp ON s.vmp_id = vp.vmp_id
            INNER JOIN untappd_products up ON vp.vmp_id = up.vmp_id
            WHERE store_id = $1
            ORDER BY up.rating DESC
            `,
			[storeId],
		);

		return stock.rows.map(this.mapRowToStock);
	}

	public async saveStore(store: Store) {
		await this.connectionPool.query(
			`
		INSERT INTO stores 
			(store_id, name, formatted_name, category, address, city, zip, lon, lat)
		VALUES
			($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT(store_id) DO UPDATE SET
			name = $2,
			formatted_name = $3,
			category = $4,
			address = $5,
			city = $6,
			zip = $7,
			lon = $8,
			lat = $9
		`,
			[
				store.store_id,
				store.name,
				store.formatted_name,
				store.category,
				store.address,
				store.city,
				store.zip,
				store.lon,
				store.lat,
			],
		);
	}

	public async deleteStore(storeId: string) {
		await this.connectionPool.query('DELETE FROM stores WHERE store_id = $1', [
			storeId,
		]);
	}

	private mapToStore(row: StoresRow): Store {
		return new Store(
			row.store_id,
			row.name,
			row.formatted_name,
			row.category,
			row.address,
			row.city,
			row.zip,
			row.lon,
			row.lat,
		);
	}

	private mapRowToStock(
		row: StockRow & VinmonopoletProductRow & UntappdProductRow,
	) {
		return new Stock(
			row.store_id,
			mapRowToVinmonopoletProduct(row),
			row.stock_level,
			new Date(row.last_updated),
		);
	}
}
