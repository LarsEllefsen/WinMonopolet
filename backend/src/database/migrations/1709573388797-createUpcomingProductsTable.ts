import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUpcomingProductsTable1709573388797
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS upcoming_products (
            vmp_id TEXT PRIMARY KEY NOT NULL,
            release_date TIMESTAMPTZ NOT NULL,
            FOREIGN KEY(vmp_id) REFERENCES vinmonopolet_products(vmp_id)
            )`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE upcoming_products`);
	}
}
