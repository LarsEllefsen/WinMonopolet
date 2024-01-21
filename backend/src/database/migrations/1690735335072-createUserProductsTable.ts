import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProductsTable1690735335072
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS user_products (
                user_id text NOT NULL,
                untappd_id text NOT NULL,
                user_score real NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id),
                PRIMARY KEY(user_id, untappd_id)
            );
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE user_products`);
	}
}
