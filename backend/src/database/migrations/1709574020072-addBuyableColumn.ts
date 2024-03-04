import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBuyableColumn1709574020072 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE vinmonopolet_products ADD buyable boolean NOT NULL DEFAULT true`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE vinmonopolet_products DROP COLUMN buyable`,
		);
	}
}
