import { CONNECTION_POOL } from '@modules/database/database.module';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DatabaseError, Pool } from 'pg';
import { FavoriteStore } from '../entities/favoriteStore.entity';

export type FavoriteStoreRow = {
	user_id: string;
	store_id: string;
};

@Injectable()
export class FavoriteStoreRepository {
	constructor(@Inject(CONNECTION_POOL) private readonly connectionPool: Pool) {}

	async saveFavoriteStore(favoriteStore: FavoriteStore) {
		try {
			await this.connectionPool.query(
				'INSERT INTO user_favorited_stores (user_id, store_id) VALUES ($1, $2)',
				[favoriteStore.userId, favoriteStore.store_id],
			);
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (e.code === '23505') {
					throw new ConflictException(
						`User ${favoriteStore.userId} already has a favorite store with id ${favoriteStore.store_id}`,
					);
				}
			} else {
				throw e;
			}
		}
	}

	async getAllFavoriteStoresForUser(userId: string) {
		const favoriteStores = await this.connectionPool.query(
			'SELECT * FROM user_favorited_stores WHERE user_id = $1',
			[userId],
		);

		return favoriteStores.rows.map(this.mapToFavoriteStore);
	}

	async getFavoriteStore(
		userId: string,
		storeId: string,
	): Promise<FavoriteStore | null> {
		const favoriteStores = await this.connectionPool.query(
			'SELECT * FROM user_favorited_stores WHERE user_id = $1 AND store_id = $2',
			[userId, storeId],
		);

		if (favoriteStores.rowCount === 0) return null;

		return this.mapToFavoriteStore(favoriteStores.rows[0]);
	}

	async deleteFavoriteStore(userId: string, storeId: string) {
		await this.connectionPool.query(
			'DELETE FROM user_favorited_stores WHERE user_id = $1 AND store_id = $2',
			[userId, storeId],
		);
	}

	mapToFavoriteStore(row: FavoriteStoreRow): FavoriteStore {
		return new FavoriteStore(row.user_id, row.store_id);
	}
}
