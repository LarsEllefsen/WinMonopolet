import { APILimitReachedException } from '@exceptions/APILimitReachedException';
import { StoresService } from '@modules/stores/stores.service';
import { UntappdService } from '@modules/untappd/untappd.service';
import { InjectQueue } from '@nestjs/bull';
import {
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bull';
import { randomBytes } from 'crypto';
import { FavoriteStore } from './entities/favoriteStore.entity';
import { User } from './entities/user.entity';
import { UserNotification } from './entities/userNotification.entity';
import { FavoriteStoreRepository } from './repositories/favoriteStore.repository';
import { UserRepository } from './repositories/user.repository';
import { UserNotificationRepository } from './repositories/userNotification.repository';
import { UserProductsRepository } from './repositories/userProducts.repository';

@Injectable()
export class UsersService {
	constructor(
		private readonly untappdService: UntappdService,
		private readonly storeService: StoresService,
		private readonly userRepository: UserRepository,
		private readonly favoriteStoreRepository: FavoriteStoreRepository,
		private readonly userProductRepository: UserProductsRepository,
		private readonly userNotificationRepository: UserNotificationRepository,
		@InjectQueue('user') private userQueue: Queue,
	) {}

	private readonly logger = new Logger(UsersService.name);

	/**
	 * Tries to get the authenticated user by userId.
	 * If no userId is given tries to find the user by accesss token.
	 * @param userId
	 * @param accessToken
	 * @returns User
	 */
	async getAuthenticatedUser(userId: string | null, accessToken: string) {
		let authenciatedUser: User | null = null;
		if (userId) {
			authenciatedUser = await this.userRepository.getUser(userId);
		} else {
			const users = await this.userRepository.getAllUsers();

			authenciatedUser =
				users.find((user) => user.accessToken === accessToken) ?? null;
		}

		if (authenciatedUser === null)
			throw new NotFoundException('No authenticated user found');

		return authenciatedUser;
	}

	/**
	 * Fetches the user from Untappd using the authenticated users accessToken.
	 * Either creates a new user or updates the existing one.
	 * Returns the newly created or newly updated user.
	 * @param accessToken
	 * @returns User
	 */
	async saveUser(accessToken: string): Promise<User> {
		try {
			const untappdUser = await this.untappdService.getUserInfo(accessToken);
			const existingUser = await this.userRepository.getUser(untappdUser.id);

			if (existingUser) {
				existingUser.accessToken = accessToken;
				await this.userRepository.updateUser(existingUser);
			} else {
				const newUser = new User(
					untappdUser.id,
					untappdUser.userName,
					untappdUser.userAvatar,
					untappdUser.userAvatarHD,
					untappdUser.firstName,
					accessToken,
					randomBytes(16),
				);
				await this.userRepository.saveUser(newUser);
			}
			const savedUser = await this.userRepository.getUser(untappdUser.id);
			if (savedUser === null)
				throw new InternalServerErrorException(
					'Something went wrong saving user',
				);

			return savedUser;
		} catch (error) {
			if (error instanceof APILimitReachedException) {
				this.logger.log(
					`User has reached their api limit, trying to return cached user based on accessToken.`,
				);
				return this.getAuthenticatedUser(null, accessToken);
			}
			this.logger.error(
				`Unable to save user: ${error?.message ?? error}`,
				error?.stack,
			);
			throw error;
		}
	}

	async addUserToQueue(userId: string) {
		await this.userQueue.add({
			userId,
		});
	}

	async getUser(userId: string) {
		return this.userRepository.getUser(userId);
	}

	getAllUsers() {
		return this.userRepository.getAllUsers();
	}

	async addFavoriteStore(userId: string, storeId: string) {
		const user = await this.userRepository.getUser(userId);
		if (user === null)
			throw new NotFoundException(`No user with id ${userId} found`);
		const store = await this.storeService.getStore(storeId);

		const newFavoriteStore = new FavoriteStore(user.id, store.store_id);
		await this.favoriteStoreRepository.saveFavoriteStore(newFavoriteStore);
	}

	async removeFavoriteStore(userId: string, storeId: string) {
		const user = await this.userRepository.getUser(userId);
		if (user === null)
			throw new NotFoundException(`No user with id ${userId} found`);

		const store = await this.favoriteStoreRepository.getFavoriteStore(
			userId,
			storeId,
		);
		if (store === null)
			throw new NotFoundException(
				`User has no favorited store with id ${storeId}`,
			);
		await this.favoriteStoreRepository.deleteFavoriteStore(userId, storeId);
	}

	getFavoriteStores(userId: string) {
		return this.favoriteStoreRepository.getAllFavoriteStoresForUser(userId);
	}

	getUserProducts(userId: string) {
		return this.userProductRepository.getUserProducts(userId);
	}

	async addUserNotification(
		userId: string,
		email: string,
		notificationType: string,
	) {
		const user = await this.userRepository.getUser(userId);
		if (user === null) {
			throw new NotFoundException(`No user with id ${userId} found`);
		}

		await this.userNotificationRepository.saveNotification(
			new UserNotification(userId, email, notificationType),
		);
	}

	async getUserNotification(userId: string) {
		const userNotification =
			await this.userNotificationRepository.getUserNotification(userId);
		if (userNotification == null) {
			throw new NotFoundException(`User ${userId} has no notifications`);
		}

		return userNotification;
	}

	async deleteUser(userId: string) {
		const user = await this.userRepository.getUser(userId);
		if (user === null) {
			throw new NotFoundException(`No user with id ${userId} found`);
		}
		await this.userRepository.deleteUser(userId);
		this.logger.log(`Successfully deleted user ${userId}`);
	}
}
