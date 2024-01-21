import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserWishlistProductsTable1702410212830
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS user_wishlist_products (
            user_id TEXT NOT NULL,
            untappd_id TEXT NOT NULL,
            added TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id),
            PRIMARY KEY(user_id, untappd_id)
        )`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE user_wishlist_products`);
	}
}
