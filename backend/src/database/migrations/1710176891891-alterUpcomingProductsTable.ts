import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUpcomingProductsTable1710176891891
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE upcoming_products ALTER COLUMN release_date TYPE DATE`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE upcoming_products ALTER COLUMN release_date TYPE TIMESTAMPTZ`,
		);
	}
}
