import { Column, Entity, JoinColumn, PrimaryColumn } from 'typeorm';

@Entity('user_notification')
export class UserNotification {
	@PrimaryColumn({ name: 'user_id', type: 'text' })
	@JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
	userId: string;

	@Column()
	email: string;

	@Column({ name: 'notification_type' })
	notificationType: string;
}
