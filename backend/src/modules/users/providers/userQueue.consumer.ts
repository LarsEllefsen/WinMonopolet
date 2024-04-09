import { Process, Processor } from '@nestjs/bull';
import { UntappdService } from '@modules/untappd/untappd.service';
import { Job } from 'bull';
import { UserProduct } from '../entities/userProduct.entity';
import { Logger } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserWishlistProduct } from '../entities/userWishlistProduct.entity';
import { UserProductsRepository } from '../repositories/userProducts.repository';
import { UserWishlistRepository } from '../repositories/userWishlist.repository';
import { UserRepository } from '../repositories/user.repository';

export type UserJobData = {
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
		private readonly userProductsRepository: UserProductsRepository,
		private readonly userWishlistRepository: UserWishlistRepository,
		private readonly untappdService: UntappdService,
		private readonly userRepository: UserRepository,
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
		const numSavedUserProducts =
			await this.userProductsRepository.getNumberOfUserProducts(user.id);

		const { userProducts, totalUserProducts } =
			await this.untappdService.getUserProducts(user, numSavedUserProducts);

		for (const userProduct of userProducts) {
			await this.insertUserProduct(userProduct);
		}

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
			await this.userWishlistRepository.getNumberOfUserWishlistProducts(
				user.id,
			);

		const { wishlistProducts, totalWishlistProducts } =
			await this.untappdService.getUserWishlist(user, 0);

		for (const wishlistProduct of wishlistProducts) {
			await this.insertWishlistProduct(wishlistProduct);
		}

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
		fetchedWishlistProducts: UserWishlistProduct[],
		userId: string,
	) {
		const allSavedUserWishlistProducts =
			await this.userWishlistRepository.getUserWishlistProducts(userId);

		//Get all currently saved items that were not among the fetched products, these are removed by the user
		const productsToRemove = allSavedUserWishlistProducts.filter(
			(savedProduct) =>
				!fetchedWishlistProducts.some(
					(fetchedProduct) =>
						fetchedProduct.untappdId === savedProduct.untappdId,
				),
		);
		for (const productToRemove of productsToRemove) {
			await this.userWishlistRepository.deleteWishlistProduct(
				productToRemove.userId,
				productToRemove.untappdId,
			);
		}
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
		const user = await this.userRepository.getUser(userId);
		if (user === null) throw new Error(`No user with id ${userId} exists.`);

		return user;
	}

	private async insertWishlistProduct(wishlistProduct: UserWishlistProduct) {
		try {
			await this.userWishlistRepository.saveWishlistProduct(wishlistProduct);
		} catch (error) {
			this.logger.error(
				`Unable to save wishlist product ${wishlistProduct.untappdId} for user ${wishlistProduct.userId}`,
				error?.message ?? error,
				error?.stack,
			);
		}
	}

	private async insertUserProduct(userProduct: UserProduct) {
		try {
			await this.userProductsRepository.saveUserProduct(userProduct);
		} catch (error) {
			this.logger.error(
				`Unable to save user product ${userProduct.untappdId} for user ${userProduct.userId}`,
				error?.message ?? error,
				error?.stack,
			);
		}
	}
}
