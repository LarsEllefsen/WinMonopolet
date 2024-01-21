import { UsersService } from '@modules/users/users.service';
import { InjectQueue, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Processor('notification')
@Injectable()
export class NotificationService {
	constructor(
		@InjectQueue('notification')
		private readonly notificationQueue: Queue,
		private readonly userService: UsersService,
	) {}

	//TODO
}
