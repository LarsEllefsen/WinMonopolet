import {
	Controller,
	Get,
	UseGuards,
	Post,
	UseInterceptors,
	ClassSerializerInterceptor,
	NotFoundException,
	Param,
	Delete,
	Body,
	Inject,
	BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@common/guards/auth.guard';
import { AddFavoriteStoreDTO } from './dto/addFavoriteStoreDTO';
import { UserContext } from './providers/userContext.provider';
import { AddUserNotificationDTO } from './dto/addUserNotificationDTO';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
export class UsersController {
	constructor(
		private readonly userService: UsersService,
		@Inject('USERCONTEXT')
		private userContext: () => UserContext,
	) {}

	@Get()
	async getAuthenticatedUser() {
		const user = await this.userService.getAuthenticatedUser(
			this.getUserId(),
			this.userContext().getAccessToken(),
		);
		if (user === null) throw new NotFoundException(`No user found`);
		return user;
	}

	@Get('/products')
	async getUserProducts() {
		const userId = this.getUserId();

		return this.userService.getUserProducts(userId);
	}

	@Post()
	async saveUser() {
		return this.userService.saveUser(this.userContext().accessToken);
	}

	@Post('/queue')
	addUserProducts() {
		return this.userService.addUserToQueue(this.getUserId());
	}

	@Post('/favorite_stores/')
	addFavoriteStore(@Body() addFavoriteStoreDTO: AddFavoriteStoreDTO) {
		return this.userService.addFavoriteStore(
			this.getUserId(),
			addFavoriteStoreDTO.storeId,
		);
	}

	@Delete('/favorite_stores/:store_id')
	removeFavoriteStore(@Param('store_id') storeId: string) {
		return this.userService.removeFavoriteStore(this.getUserId(), storeId);
	}

	@Get('/favorite_stores')
	getFavoriteStores() {
		return this.userService.getFavoriteStores(this.getUserId());
	}

	@Post('/notification')
	addUserNotification(@Body() addUserNotificationDTO: AddUserNotificationDTO) {
		return this.userService.addUserNotification(
			this.getUserId(),
			addUserNotificationDTO.email,
			addUserNotificationDTO.notificationType,
		);
	}

	@Get('/notification')
	getUserNotification() {
		return this.userService.getUserNotification(this.getUserId());
	}

	@Delete()
	deleteUser() {
		return this.userService.deleteUser(this.getUserId());
	}

	private getUserId() {
		const userId = this.userContext().userId;
		if (userId === undefined)
			throw new BadRequestException(`Missing userId in sessionToken`);

		return userId;
	}
}
