import { CONNECTION_POOL } from '@modules/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { UpcomingProduct } from '../entities/upcomingProduct.entity';
import { VinmonopoletProduct } from '../entities/vinmonopoletProduct.entity';
import {
	UntappdProductRow,
	VinmonopoletProductRow,
} from './products.repository';
import { mapRowToVinmonopoletProduct } from '@modules/database/mapper';

export type UpcomingProductRow = {
	vmp_id: VinmonopoletProduct;
	release_date: Date;
};

@Injectable()
export class UpcomingProductRepository {
	constructor(@Inject(CONNECTION_POOL) private connectionPool: Pool) {}

	async saveUpcomingProduct(upcomingProduct: UpcomingProduct) {
		await this.connectionPool.query(
			`INSERT INTO 
				upcoming_products (vmp_id, release_date) 
			VALUES 
				($1, $2) 
			ON CONFLICT(vmp_id) DO UPDATE SET
				release_date = EXCLUDED.release_date`,
			[upcomingProduct.vinmonopoletProduct.vmp_id, upcomingProduct.releaseDate],
		);
	}

	async getUpcomingProducts() {
		const upcomingProducts = await this.connectionPool.query<
			UpcomingProductRow & VinmonopoletProductRow & UntappdProductRow
		>(`
		SELECT *, true as active FROM upcoming_products ucp
		INNER JOIN vinmonopolet_products vp ON vp.vmp_id = ucp.vmp_id
		LEFT JOIN untappd_products up ON vp.vmp_id = up.vmp_id
		WHERE release_date >= CURRENT_DATE
		`);

		return upcomingProducts.rows.map(this.mapRowToUpcomingProduct);
	}

	async getUpcomingProductsInRelease(releaseDate: Date) {
		const upcomingProducts = await this.connectionPool.query<
			UpcomingProductRow & VinmonopoletProductRow & UntappdProductRow
		>(
			`
		SELECT *, true as active FROM upcoming_products ucp
		JOIN vinmonopolet_products vp ON vp.vmp_id = ucp.vmp_id
		LEFT JOIN untappd_products up ON vp.vmp_id = up.vmp_id
		WHERE release_date = $1
		AND up.untappd_id IS NOT NULL
		ORDER BY up.rating DESC
		`,
			[releaseDate],
		);

		return upcomingProducts.rows.map(this.mapRowToUpcomingProduct);
	}

	async getAllReleaseDates() {
		const upcomingProducts = await this.connectionPool.query<{
			release_date: Date;
		}>(`SELECT DISTINCT release_date FROM upcoming_products`);

		return upcomingProducts.rows.map((release) => release.release_date);
	}

	private mapRowToUpcomingProduct(
		row: UpcomingProductRow & VinmonopoletProductRow & UntappdProductRow,
	): UpcomingProduct {
		return new UpcomingProduct(
			mapRowToVinmonopoletProduct(row),
			new Date(row.release_date),
		);
	}
}
