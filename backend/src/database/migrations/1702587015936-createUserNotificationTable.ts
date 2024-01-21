import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserNotificationTable1702587015936
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS user_notification (
            user_id text PRIMARY KEY NOT NULL,
            email text NOT NULL,
            notification_type text NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE user_notification`);
	}
}
