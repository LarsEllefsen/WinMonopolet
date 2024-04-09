import { CONNECTION_POOL } from '@modules/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { UserNotification } from '../entities/userNotification.entity';

export type UserNotificationRow = {
	user_id: string;
	email: string;
	notification_type: string;
};

@Injectable()
export class UserNotificationRepository {
	constructor(@Inject(CONNECTION_POOL) private readonly connectionPool: Pool) {}

	public async saveNotification(notification: UserNotification) {
		await this.connectionPool.query(
			'INSERT INTO user_notifications (user_id, email, notification_type) VALUES ($1, $2, $3)',
			[notification.userId, notification.email, notification.notificationType],
		);
	}

	public async getUserNotification(
		userId: string,
	): Promise<UserNotification | null> {
		const notification = await this.connectionPool.query(
			'SELECT * FROM user_notification WHERE user_id = $1',
			[userId],
		);

		if (notification.rowCount === 0) return null;

		return this.mapToUserNotification(notification.rows[0]);
	}

	private mapToUserNotification(row: UserNotificationRow) {
		return new UserNotification(row.user_id, row.email, row.notification_type);
	}
}
