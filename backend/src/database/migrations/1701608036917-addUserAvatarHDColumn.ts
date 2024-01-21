import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAvatarHDColumn1701608036917 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE users ADD COLUMN user_avatar_hd text`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE users DROP COLUMN user_avatar_hd`);
	}
}
