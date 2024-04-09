import { CONNECTION_POOL } from '@modules/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { UserProduct } from '../entities/userProduct.entity';

export type UserProductRow = {
	user_id: string;
	untappd_id: string;
	user_score: number;
};

@Injectable()
export class UserProductsRepository {
	constructor(@Inject(CONNECTION_POOL) private readonly connectionPool: Pool) {}

	async saveUserProduct(userProduct: UserProduct) {
		await this.connectionPool.query(
			`INSERT INTO user_products 
				(user_id, untappd_id, user_score) 
			VALUES 
				($1, $2, $3)
			ON CONFLICT DO NOTHING`,
			[userProduct.userId, userProduct.untappdId, userProduct.userScore],
		);
	}

	async getUserProducts(userId: string) {
		const userProducts = await this.connectionPool.query<UserProductRow>(
			'SELECT * FROM user_products WHERE user_id = $1',
			[userId],
		);

		return userProducts.rows.map(this.mapToUserProduct);
	}

	async getNumberOfUserProducts(userId: string): Promise<number> {
		const numberOfUserProducts = await this.connectionPool.query<{
			count: number;
		}>('SELECT COUNT(*) FROM user_products WHERE user_id = $1', [userId]);

		return numberOfUserProducts.rows[0].count;
	}

	private mapToUserProduct(row: UserProductRow): UserProduct {
		return new UserProduct(row.user_id, row.untappd_id, row.user_score);
	}
}
