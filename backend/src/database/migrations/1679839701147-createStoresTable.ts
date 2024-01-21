import { MigrationInterface, QueryRunner } from 'typeorm';

export class createStoresTable1679839701147 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE IF NOT EXISTS stores (
				store_id TEXT PRIMARY KEY, 
				name TEXT NOT NULL, 
				formatted_name TEXT NOT NULL, 
				category INTEGER NOT NULL, 
				address TEXT NOT NULL, 
				city TEXT NOT NULL, 
				zip TEXT NOT NULL, 
				lon TEXT NOT NULL, 
				lat TEXT NOT NULL
			)`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE stores`);
	}
}
