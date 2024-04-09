import { CONNECTION_POOL } from '@modules/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { UserWishlistProduct } from '../entities/userWishlistProduct.entity';

export type UserWishlistProductRow = {
	user_id: string;
	untappd_id: string;
	added: string;
};

@Injectable()
export class UserWishlistRepository {
	constructor(@Inject(CONNECTION_POOL) private readonly connectionPool: Pool) {}

	async saveWishlistProduct(wishlistProduct: UserWishlistProduct) {
		await this.connectionPool.query(
			`INSERT INTO user_wishlist_products 
                (user_id, untappd_id) 
            VALUES 
                ($1, $2)
            ON CONFLICT DO NOTHING`,
			[wishlistProduct.userId, wishlistProduct.untappdId],
		);
	}

	async deleteWishlistProduct(userId: string, untappdId: string) {
		await this.connectionPool.query(
			`DELETE FROM user_wishlist_products WHERE user_id = $1 AND untappd_id = $2`,
			[userId, untappdId],
		);
	}

	async getUserWishlistProducts(
		userId: string,
	): Promise<UserWishlistProduct[]> {
		const userWishlistProducts = await this.connectionPool.query(
			'SELECT * FROM user_wishlist_products WHERE user_id = $1',
			[userId],
		);

		return userWishlistProducts.rows.map(this.mapToUserWishlistProduct);
	}

	async getNumberOfUserWishlistProducts(userId: string) {
		const numberOfUserWishlistProducts = await this.connectionPool.query<{
			count: string;
		}>('SELECT COUNT(*) FROM user_wishlist_products WHERE user_id = $1', [
			userId,
		]);

		return Number(numberOfUserWishlistProducts.rows[0].count);
	}

	private mapToUserWishlistProduct(
		row: UserWishlistProductRow,
	): UserWishlistProduct {
		return new UserWishlistProduct(
			row.user_id,
			row.untappd_id,
			new Date(row.added),
		);
	}
}
