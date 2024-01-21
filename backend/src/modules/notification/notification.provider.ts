import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { UsersService } from '@modules/users/users.service';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

type NotificationJobData = {
	product: VinmonopoletProduct;
};

@Processor('notification')
@Injectable()
export class NotificationService {
	constructor(
		@InjectQueue('notification')
		private readonly notificationQueue: Queue,
		private readonly userService: UsersService,
	) {}

	async addProductToNotificationQueue(
		vinmonopoletProduct: VinmonopoletProduct,
	) {
		await this.notificationQueue.add({
			test: 'jepp just testing of course!',
		});
	}

	@Process()
	async notifyUsersOfWishlistProduct() {
		// this.userService.getUserNotification
		console.log('Yes, im processing from inside the injectable?!');
	}
}
