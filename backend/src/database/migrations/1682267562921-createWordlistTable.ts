import { MigrationInterface, QueryRunner } from 'typeorm';

export class createWordlistTable1682267562921 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS wordlist (
                id serial PRIMARY KEY,
                value text NOT NULL
            );
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            DROP TABLE wordlist;
        `);
	}
}
