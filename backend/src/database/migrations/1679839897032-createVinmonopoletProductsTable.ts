import { MigrationInterface, QueryRunner } from 'typeorm';

export class createVinmonopoletProductsTable1679839897032
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE IF NOT EXISTS vinmonopolet_products (
                vmp_id TEXT PRIMARY KEY, 
                vmp_name TEXT NOT NULL, 
                vmp_url TEXT NOT NULL, 
                price REAL NOT NULL, 
                category TEXT NOT NULL, 
                sub_category TEXT, 
                product_selection TEXT NOT NULL, 
                container_size TEXT NOT NULL, 
                country TEXT NOT NULL, 
                added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, 
                last_updated TIMESTAMPTZ NOT NULL, 
                active boolean NOT NULL
            )`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE vinmonopolet_products`);
	}
}
