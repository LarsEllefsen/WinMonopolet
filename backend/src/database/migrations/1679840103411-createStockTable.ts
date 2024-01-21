import { MigrationInterface, QueryRunner } from 'typeorm';

export class createStockTable1679840103411 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		queryRunner.query(
			`CREATE TABLE IF NOT EXISTS stock (
		        store_id TEXT NOT NULL,
		        vmp_id TEXT NOT NULL,
		        stock_level INTEGER NOT NULL,
		        last_updated TIMESTAMPTZ NOT NULL,
		        PRIMARY KEY(store_id, vmp_id),
		        FOREIGN KEY(store_id) REFERENCES stores(store_id),
		        FOREIGN KEY(vmp_id) REFERENCES vinmonopolet_products(vmp_id))`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE stock`);
	}
}
