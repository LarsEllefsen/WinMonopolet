import { Process, Processor } from '@nestjs/bull';
import { UntappdService } from '@modules/untappd/untappd.service';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProduct } from '../entities/userProduct.entity';
import { Not, In, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { UserWishlistProduct } from '../entities/userWishlistProduct.entity';

type UserJobData = {
	userId: string;
};

type ProcessResult = {
	processName: string;
	user: User;
	totalProducts: number;
	totalSavedProducts: number;
	numberOfNewProductsFound: number;
};

type JobResult = {
	job: Job<UserJobData>;
	results: ProcessResult[];
};

@Processor('user')
export class UserQueueConsumer {
	constructor(
		@InjectRepository(UserProduct)
		private readonly userProductRepository: Repository<UserProduct>,
		@InjectRepository(UserWishlistProduct)
		private readonly userWishlistProductRepository: Repository<UserWishlistProduct>,
		private readonly untappdService: UntappdService,
		private readonly userService: UsersService,
	) {}

	private readonly logger = new Logger(UserQueueConsumer.name);

	@Process()
	async processUserQueue(job: Job<UserJobData>) {
		try {
			const { userId } = job.data;
			const user = await this.getUser(userId);

			const saveUserProductsFromUntappdResult =
				await this.saveUserProductsFromUntappd(user);

			const saveUserWishlistProductsFromUntappdResult =
				await this.saveUserWishlistProductsFromUntappd(user);

			this.checkIfJobCompletedSuccessfully({
				job,
				results: [
					saveUserProductsFromUntappdResult,
					saveUserWishlistProductsFromUntappdResult,
				],
			});
		} catch (error) {
			this.logger.error(
				`Job (getUserProducts) - Attempt ${job.attemptsMade}: Failed to process products for user ${job.data.userId}. ${error} `,
				error?.stack,
			);
			throw error;
		}
	}

	private async saveUserProductsFromUntappd(user: User) {
		const numSavedUserProducts = await this.userProductRepository.countBy({
			userId: user.id,
		});

		const { userProducts, totalUserProducts } =
			await this.untappdService.getUserProducts(user, numSavedUserProducts);

		await this.userProductRepository.upsert(userProducts, {
			conflictPaths: ['untappdId', 'userId'],
			skipUpdateIfNoValuesChanged: true,
		});

		return {
			processName: 'Save untappd checkins',
			user,
			totalProducts: totalUserProducts,
			totalSavedProducts: numSavedUserProducts + userProducts.length,
			numberOfNewProductsFound: userProducts.length,
		} as ProcessResult;
	}

	private async saveUserWishlistProductsFromUntappd(user: User) {
		const numSavedUserWishlistedProducts =
			await this.userWishlistProductRepository.countBy({
				userId: user.id,
			});

		const { wishlistProducts, totalWishlistProducts } =
			await this.untappdService.getUserWishlist(user, 0);

		await this.userWishlistProductRepository.upsert(wishlistProducts, {
			conflictPaths: ['untappdId', 'userId'],
			skipUpdateIfNoValuesChanged: true,
		});

		if (numSavedUserWishlistedProducts > wishlistProducts.length) {
			await this.deleteAnyRemovedWishlistProducts(wishlistProducts, user.id);
		}

		return {
			processName: 'save user wishlist',
			user,
			totalProducts: totalWishlistProducts,
			totalSavedProducts: wishlistProducts.length,
			numberOfNewProductsFound:
				wishlistProducts.length - numSavedUserWishlistedProducts,
		} as ProcessResult;
	}

	private async deleteAnyRemovedWishlistProducts(
		products: UserWishlistProduct[],
		userId: string,
	) {
		const productsToRemove = await this.userWishlistProductRepository.findBy({
			untappdId: Not(In(products.map((product) => product.untappdId))),
			userId,
		});
		await this.userWishlistProductRepository.remove(productsToRemove);
		this.logger.log(
			`Removed ${productsToRemove.length} wishlist products from user ${userId}`,
		);
	}

	private checkIfJobCompletedSuccessfully({ job, results }: JobResult) {
		results.forEach(
			({
				numberOfNewProductsFound,
				processName,
				totalProducts,
				totalSavedProducts,
				user,
			}) => {
				const remainingProducts = totalProducts - totalSavedProducts;

				if (numberOfNewProductsFound === 0) {
					this.logger.debug(
						`Job (${processName}) - All products for user ${user.id} are already up to date (${totalProducts} products saved)`,
					);
					return;
				}

				if (remainingProducts > 0) {
					this.logger.log(
						`Job (${processName}) - Attempt ${
							job.attemptsMade
						}: Did not finish processing user ${
							user.id
						}. There are currently ${totalSavedProducts} saved products and ${
							totalProducts - totalSavedProducts
						} remaining products.`,
					);

					throw new Error(
						`Did not finish processing user: ${remainingProducts} remaining products.`,
					);
				}

				this.logger.log(
					`Job (${processName}) - Attempt ${job.attemptsMade}: Successfully processed user ${user.id}: saved ${totalSavedProducts} products`,
				);
			},
		);
	}

	private async getUser(userId: string) {
		const user = await this.userService.getUserById(userId);
		if (user === null) throw new Error(`No user with id ${userId} exists.`);

		return user;
	}
}
