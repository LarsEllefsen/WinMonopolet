import {
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UntappdService } from '@modules/untappd/untappd.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { StoresService } from '@modules/stores/stores.service';
import { FavoriteStore } from './entities/favoriteStore.entity';
import { Store } from '@modules/stores/entities/stores.entity';
import { UserProduct } from './entities/userProduct.entity';
import { APILimitReachedException } from '@exceptions/APILimitReachedException';
import { UserNotification } from './entities/userNotification.entity';
import { UserWishlistProduct } from './entities/userWishlistProduct.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(UserProduct)
		private readonly userProductsRepository: Repository<UserProduct>,
		@InjectRepository(FavoriteStore)
		private readonly favoriteStoreRepository: Repository<FavoriteStore>,
		@InjectRepository(UserNotification)
		private readonly userNotificationRepository: Repository<UserNotification>,
		@InjectRepository(UserWishlistProduct)
		private readonly userwishlistRepository: Repository<UserWishlistProduct>,
		private readonly untappdService: UntappdService,
		private readonly storeService: StoresService,
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
			authenciatedUser = await this.getUserById(userId);
		} else {
			const users = await this.userRepository.find();

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
			const retrievedUser = await this.getUntappdUser(accessToken);
			const existingUser = await this.getUserById(retrievedUser.id);

			if (existingUser) {
				await this.saveUpdatedUser(existingUser, retrievedUser, accessToken);
			} else {
				await this.saveNewUser(retrievedUser, accessToken);
			}
			const savedUser = await this.userRepository.findOneBy({
				id: retrievedUser.id,
			});
			if (savedUser === null)
				throw new InternalServerErrorException(
					'Something went wrong saving user',
				);

			return savedUser;
		} catch (error) {
			if (error instanceof APILimitReachedException) {
				this.logger.debug(
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

	getUserById(userId: string) {
		return this.userRepository.findOne({
			where: { id: userId },
		});
	}

	getAllUsers() {
		return this.userRepository.find();
	}

	async addFavoriteStore(userId: string, storeId: string) {
		const user = await this.getUserById(userId);
		if (user === null)
			throw new NotFoundException(`No user with id ${userId} found`);
		const store = await this.storeService.getStore(storeId);

		await this.saveFavoriteStore(user, store);
	}

	async removeFavoriteStore(userId: string, storeId: string) {
		const user = await this.getUserById(userId);
		if (user === null)
			throw new NotFoundException(`No user with id ${userId} found`);

		const store = await this.favoriteStoreRepository.findOne({
			where: { store_id: storeId, userId: user.id },
		});
		if (store === null)
			throw new NotFoundException(
				`User has no favorited store with id ${storeId}`,
			);
		await this.deleteFavoriteStore(store);
	}

	getFavoriteStores(userId: string) {
		return this.favoriteStoreRepository.find({
			where: { userId },
		});
	}

	getUserProducts(userId: string) {
		return this.userProductsRepository.findBy({ userId });
	}

	async addUserNotification(
		userId: string,
		email: string,
		notificationType: string,
	) {
		const user = await this.getUserById(userId);
		if (user === null) {
			throw new NotFoundException(`No user with id ${userId} found`);
		}

		await this.userNotificationRepository.upsert(
			this.userNotificationRepository.create({
				email,
				userId,
				notificationType,
			}),
			{ skipUpdateIfNoValuesChanged: true, conflictPaths: ['userId'] },
		);
	}

	async getUserNotification(userId: string) {
		const userNotification = await this.userNotificationRepository.findOneBy({
			userId,
		});
		if (userNotification == null) {
			throw new NotFoundException(`User ${userId} has no notifications`);
		}

		return userNotification;
	}

	async deleteUser(userId: string) {
		const user = await this.getUserById(userId);
		if (user === null) {
			throw new NotFoundException(`No user with id ${userId} found`);
		}
		await this.userProductsRepository.delete({ userId });
		await this.favoriteStoreRepository.delete({ userId });
		await this.userwishlistRepository.delete({ userId });
		await this.userRepository.remove(user);
		this.logger.log(`Successfully deleted user ${userId}`);
	}

	private saveNewUser(retrievedUntappdUser: User, accessToken: string) {
		const newUser = this.userRepository.create({
			id: retrievedUntappdUser.id,
			userName: retrievedUntappdUser.userName,
			userAvatar: retrievedUntappdUser.userAvatar,
			userAvatarHD: retrievedUntappdUser.userAvatarHD,
			firstName: retrievedUntappdUser.firstName,
			accessToken: accessToken,
			salt: randomBytes(16),
		});
		return this.userRepository.insert(newUser);
	}

	private saveUpdatedUser(
		existingUser: User,
		retrievedUntappdUser: User,
		accessToken: string,
	) {
		existingUser.accessToken = accessToken;
		existingUser.userAvatar = retrievedUntappdUser.userAvatar;
		existingUser.userAvatarHD = retrievedUntappdUser.userAvatarHD;
		existingUser.firstName = retrievedUntappdUser.firstName;
		return this.userRepository.upsert(existingUser, ['id']);
	}

	private getUntappdUser(accessToken: string) {
		return this.untappdService.getUserInfo(accessToken);
	}

	private saveFavoriteStore(user: User, store: Store) {
		const newFavoriteStore = this.favoriteStoreRepository.create({
			user,
			store,
			userId: user.id,
			store_id: store.store_id,
		});
		return this.favoriteStoreRepository.save(newFavoriteStore);
	}

	private deleteFavoriteStore(favoriteStore: FavoriteStore) {
		return this.favoriteStoreRepository.remove(favoriteStore);
	}
}
