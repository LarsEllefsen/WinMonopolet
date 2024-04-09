export class UserNotification {
	constructor(userId: string, email: string, notificationType: string) {
		this.userId = userId;
		this.email = email;
		this.notificationType = notificationType;
	}
	userId: string;

	email: string;

	notificationType: string;
}
