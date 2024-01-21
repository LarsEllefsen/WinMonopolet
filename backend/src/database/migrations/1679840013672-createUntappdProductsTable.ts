import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUntappdProductsTable1679840013672
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
                CREATE TABLE IF NOT EXISTS untappd_products (
                        untappd_id TEXT NOT NULL, 
                        vmp_id TEXT PRIMARY KEY NOT NULL, 
                        untappd_name TEXT NOT NULL, 
                        abv REAL NOT NULL, 
                        rating REAL NOT NULL, 
                        num_ratings INTEGER NOT NULL, 
                        untappd_url TEXT NOT NULL, 
                        picture_url TEXT, 
                        style TEXT NOT NULL, 
                        brewery TEXT NOT NULL, 
                        last_updated TIMESTAMPTZ NOT NULL, 
                        FOREIGN KEY(vmp_id) REFERENCES vinmonopolet_products(vmp_id)
                )
                `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE untappd_products`);
	}
}
