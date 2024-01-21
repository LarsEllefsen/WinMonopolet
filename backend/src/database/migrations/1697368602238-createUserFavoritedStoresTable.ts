import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserFavoritedStoresTable1697368602238
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS user_favorited_stores (
            user_id text NOT NULL,
            store_id text NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(store_id) REFERENCES stores(store_id),
            PRIMARY KEY(user_id, store_id)
        )`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE user_favorited_stores`);
	}
}
