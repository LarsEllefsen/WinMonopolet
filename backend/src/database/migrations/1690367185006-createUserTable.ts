import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1690367185006 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users (
                id text PRIMARY KEY,
				user_name text NOT NULL,
				user_avatar text NOT NULL,
				first_name text,
				access_token text NOT NULL,
				salt text NOT NULL,
				created timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated timestamptz NOT NULL
            );
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            DROP TABLE users;
        `);
	}
}
