import { CONNECTION_POOL } from '@modules/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { mapRowToVinmonopoletProduct } from '@modules/database/mapper';
import { ProductSortKey, SortDirection } from '@common/types/QueryParameters';

export type VinmonopoletProductRow = {
	vmp_id: string;
	vmp_name: string;
	vmp_url: string;
	price: number;
	category: string;
	sub_category: string | null;
	product_selection: string;
	container_size: string;
	country: string;
	added_date: string;
	last_updated: string;
	active: boolean;
	buyable: boolean;
	availability?: string;
};

export type UntappdProductRow = {
	untappd_id: string;
	vmp_id: string;
	untappd_name: string;
	abv: number;
	rating: number;
	num_ratings: number;
	untappd_url: string;
	picture_url: string;
	style: string;
	brewery: string;
	last_updated: string;
};

@Injectable()
export class ProductsRepository {
	constructor(@Inject(CONNECTION_POOL) private connectionPool: Pool) {}

	public async getProductById(
		vinmonopoletProductId: string,
	): Promise<VinmonopoletProduct | null> {
		const product = await this.connectionPool.query(
			`
		SELECT
			vp.vmp_id,
			vp.vmp_name,
			vp.vmp_url,
			vp.price,
			vp.category,
			vp.sub_category,
			vp.product_selection,
			vp.container_size,
			vp.country,
			vp.added_date,
			vp.last_updated,
			EXISTS(select 1 from stock s WHERE s.vmp_id = $1) as active,
			vp.buyable,
			up.* 
		FROM 
			vinmonopolet_products vp
		LEFT JOIN 
			untappd_products up ON vp.vmp_id = up.vmp_id
		WHERE 
			vp.vmp_id = $1`,
			[vinmonopoletProductId],
		);

		if (product.rowCount === 0) return null;
		return mapRowToVinmonopoletProduct(product.rows[0]);
	}

	public async getProducts(
		active?: boolean,
		hasUntappdProduct?: boolean,
		searchQuery?: string,
		categories?: string[],
		subCategories?: string[],
		limit?: number,
		offset?: number,
		sortBy?: ProductSortKey,
		sort?: SortDirection,
	) {
		const { query, parameters } = this.buildGetProductsQuery(
			active,
			hasUntappdProduct,
			searchQuery,
			categories,
			subCategories,
			limit,
			offset,
			sortBy,
			sort,
		);

		const products = await this.connectionPool.query<
			VinmonopoletProductRow & UntappdProductRow
		>(query, parameters);

		return products.rows.map(mapRowToVinmonopoletProduct);
	}

	public async getProductsWithScoreOfZero() {
		const products = await this.connectionPool.query(
			`SELECT 
				vp.vmp_id,
				vp.vmp_name,
				vp.vmp_url,
				vp.price,
				vp.category,
				vp.sub_category,
				vp.product_selection,
				vp.container_size,
				vp.country,
				vp.added_date,
				vp.last_updated,
				true AS active,
				vp.buyable,
				up.*  
			FROM 
				vinmonopolet_products vp 
			INNER JOIN 
				untappd_products up ON vp.vmp_id = up.vmp_id 
			WHERE 
				up.rating = 0
			AND
				EXISTS(SELECT 1 FROM stock s WHERE s.vmp_id = vp.vmp_id)
			`,
		);
		return products.rows.map(mapRowToVinmonopoletProduct);
	}

	public async getOldestUntappdProducts(limit = 100) {
		const products = await this.connectionPool.query(
			`
			SELECT 
				vp.vmp_id,
				vp.vmp_name,
				vp.vmp_url,
				vp.price,
				vp.category,
				vp.sub_category,
				vp.product_selection,
				vp.container_size,
				vp.country,
				vp.added_date,
				vp.last_updated,
				true AS active,
				vp.buyable,
				up.*  
			FROM 
				vinmonopolet_products vp 
			INNER JOIN 
				untappd_products up ON vp.vmp_id = up.vmp_id
			WHERE 
				EXISTS(SELECT 1 FROM stock s WHERE s.vmp_id = vp.vmp_id)
			ORDER BY up.last_updated ASC LIMIT $1`,
			[limit],
		);

		return products.rows.map(mapRowToVinmonopoletProduct);
	}

	public async deleteUntappdProduct(untappdId: string) {
		await this.connectionPool.query(
			'DELETE FROM untappd_products up WHERE up.untappd_id = $1',
			[untappdId],
		);
	}

	public async vinmonopoletProductHasUntappdProduct(
		vinmonopoletProductId: string,
	): Promise<boolean> {
		const result = await this.connectionPool.query<{ exists: boolean }>(
			'SELECT exists (select 1 FROM vinmonopolet_products vp INNER JOIN untappd_products up  ON vp.vmp_id = up.vmp_id WHERE vp.vmp_id = $1)',
			[vinmonopoletProductId],
		);
		return result.rows[0].exists;
	}

	public async saveProduct(vinmonopoletProduct: VinmonopoletProduct) {
		await this.connectionPool.query(
			`
		INSERT INTO vinmonopolet_products 
			(vmp_id, vmp_name, vmp_url, price, category, sub_category, product_selection, container_size, country, buyable) 
		VALUES 
			($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT(vmp_id)
		DO UPDATE SET
			vmp_name = EXCLUDED.vmp_name,
			vmp_url = EXCLUDED.vmp_url,
			price = EXCLUDED.price,
			category = EXCLUDED.category,
			sub_category = EXCLUDED.sub_category,
			product_selection = EXCLUDED.product_selection,
			container_size = EXCLUDED.container_size, 
			country = EXCLUDED.country,
			buyable = EXCLUDED.buyable
		`,
			[
				vinmonopoletProduct.vmp_id,
				vinmonopoletProduct.vmp_name,
				vinmonopoletProduct.vmp_url,
				vinmonopoletProduct.price,
				vinmonopoletProduct.category,
				vinmonopoletProduct.sub_category,
				vinmonopoletProduct.product_selection,
				vinmonopoletProduct.container_size,
				vinmonopoletProduct.country,
				vinmonopoletProduct.buyable,
			],
		);

		if (vinmonopoletProduct.untappd) {
			await this.saveUntappdProduct(vinmonopoletProduct.untappd);
		}
	}

	public async saveUntappdProduct(untappdProduct: UntappdProduct) {
		await this.connectionPool.query(
			`
		INSERT INTO untappd_products
			(untappd_id, vmp_id, untappd_name, abv, rating, num_ratings, untappd_url, picture_url, style, brewery)
		VALUES 
			($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT(vmp_id)
		DO UPDATE SET
			untappd_id = EXCLUDED.untappd_id,
			untappd_name = EXCLUDED.untappd_name,
			abv = EXCLUDED.abv,
			rating = EXCLUDED.rating,
			num_ratings = EXCLUDED.num_ratings,
			untappd_url = EXCLUDED.untappd_url,
			picture_url = EXCLUDED.picture_url,
			style = EXCLUDED.style,
			brewery = EXCLUDED.brewery
		`,
			[
				untappdProduct.untappd_id,
				untappdProduct.vmp_id,
				untappdProduct.untappd_name,
				untappdProduct.abv,
				untappdProduct.rating,
				untappdProduct.num_ratings,
				untappdProduct.untappd_url,
				untappdProduct.picture_url,
				untappdProduct.style,
				untappdProduct.brewery,
			],
		);
	}

	private buildGetProductsQuery(
		active?: boolean,
		hasUntappdProduct?: boolean,
		searchQuery?: string,
		categories?: string[],
		subCategories?: string[],
		limit?: number,
		offset?: number,
		sortBy = ProductSortKey.last_updated,
		sort = SortDirection.DESC,
	) {
		const hasMultipleWhereClauses =
			[
				active,
				hasUntappdProduct,
				searchQuery,
				categories,
				subCategories,
			].filter((x) => x !== undefined).length > 1;

		const queryList = [
			`SELECT 
				vp.vmp_id,
				vp.vmp_name,
				vp.vmp_url,
				vp.price,
				vp.category,
				vp.sub_category,
				vp.product_selection,
				vp.container_size,
				vp.country,
				vp.added_date,
				vp.last_updated,
				EXISTS(SELECT 1 FROM stock s WHERE s.vmp_id = vp.vmp_id) AS active,
				vp.buyable,
				up.*   
		FROM vinmonopolet_products vp`,
		];
		const parameters = [];

		// Add join on untappd products
		if (hasUntappdProduct === undefined || hasUntappdProduct === false) {
			queryList.push('LEFT JOIN untappd_products up ON vp.vmp_id = up.vmp_id');
		} else {
			queryList.push('INNER JOIN untappd_products up ON vp.vmp_id = up.vmp_id');
		}

		// Add WHERE clause for active
		if (active !== undefined) {
			queryList.push(
				active
					? 'WHERE EXISTS(SELECT 1 FROM stock s WHERE s.vmp_id = vp.vmp_id)'
					: 'WHERE NOT EXISTS(SELECT 1 FROM stock s WHERE s.vmp_id = vp.vmp_id)',
			);
		}

		// Add WHERE clause for untappd product
		if (hasUntappdProduct !== undefined) {
			queryList.push(hasMultipleWhereClauses ? 'AND' : 'WHERE');
			queryList.push(
				hasUntappdProduct
					? 'up.untappd_id IS NOT NULL'
					: 'up.untappd_id IS NULL',
			);
		}

		if (searchQuery !== undefined) {
			queryList.push(hasMultipleWhereClauses ? 'AND' : 'WHERE');
			queryList.push(`vp.vmp_name LIKE $1`);
			parameters.push(`%${searchQuery}%`);
		}

		if (categories !== undefined) {
			queryList.push(hasMultipleWhereClauses ? 'AND' : 'WHERE');
			queryList.push(
				`vp.category IN (${categories.map(
					(_, i) => `$${i + (parameters.length + 1)}`,
				)})`,
			);
			parameters.push(...categories);
		}

		if (subCategories !== undefined) {
			queryList.push(hasMultipleWhereClauses ? 'AND' : 'WHERE');

			// Sider and Mjød do not have sub categories.
			if (categories?.includes('Sider') || categories?.includes('Mjød')) {
				queryList.push(
					`(vp.sub_category IN (${subCategories.map(
						(_, i) => `$${i + (parameters.length + 1)}`,
					)}) OR vp.sub_category IS NULL)`,
				);
			} else {
				queryList.push(
					`vp.sub_category IN (${subCategories.map(
						(_, i) => `$${i + (parameters.length + 1)}`,
					)})`,
				);
			}

			parameters.push(...subCategories);
		}

		switch (sortBy) {
			case ProductSortKey.rating:
				queryList.push('ORDER BY up.rating');
				break;
			case ProductSortKey.added_date:
				queryList.push('ORDER BY vp.added_date');
				break;
			case ProductSortKey.last_updated:
				queryList.push('ORDER BY vp.last_updated');
				break;
			case ProductSortKey.price:
				queryList.push('ORDER BY vp.price');
				break;
		}

		switch (sort) {
			case SortDirection.ASC:
				queryList.push('ASC');
				break;
			case SortDirection.DESC:
				queryList.push('DESC');
				break;
		}

		if (limit !== undefined) {
			queryList.push(`LIMIT $${parameters.length + 1}`);
			parameters.push(limit);
		}

		if (offset !== undefined) {
			queryList.push(`OFFSET $${parameters.length + 1}`);
			parameters.push(offset);
		}

		return {
			query: queryList.join(' '),
			parameters: parameters.length > 0 ? parameters : undefined,
		};
	}
}
