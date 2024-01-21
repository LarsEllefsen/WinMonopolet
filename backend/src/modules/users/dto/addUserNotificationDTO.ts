import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddUserNotificationDTO {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	notificationType: string;
}
