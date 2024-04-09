import { TestBed } from '@automock/jest';
import { UntappdService } from '@modules/untappd/untappd.service';
import {
	UserJobData,
	UserQueueConsumer,
} from '@modules/users/providers/userQueue.consumer';
import { UserRepository } from '@modules/users/repositories/user.repository';
import { UserProductsRepository } from '@modules/users/repositories/userProducts.repository';
import { UserWishlistRepository } from '@modules/users/repositories/userWishlist.repository';
import { Job } from 'bull';
import {
	mockUserProducts,
	mockUserWishlistProduct1,
	mockUserWishlistProduct2,
	mockUserWishlistProduct3,
	mockUserWishlistProducts,
} from 'test/mocks/mockUserProducts';
import { mockUser1 } from 'test/mocks/mockUsers';

describe('UserQueueConsumer', () => {
	let userQueueConsumer: UserQueueConsumer;
	let userProductRepository: UserProductsRepository;
	let userWishlistRepository: UserWishlistRepository;
	let untappdService: UntappdService;
	let userRepository: UserRepository;

	const mockJob = { data: { userId: mockUser1.id } } as Job<UserJobData>;

	beforeAll(() => {
		const { unit, unitRef } = TestBed.create(UserQueueConsumer).compile();

		userQueueConsumer = unit;
		userProductRepository = unitRef.get(UserProductsRepository);
		userWishlistRepository = unitRef.get(UserWishlistRepository);
		untappdService = unitRef.get(UntappdService);
		userRepository = unitRef.get(UserRepository);
	});

	describe('processUserQueue', () => {
		it('should save the users untappd checkins and wishlist products', async () => {
			jest.spyOn(userRepository, 'getUser').mockResolvedValue(mockUser1);
			jest
				.spyOn(userProductRepository, 'getNumberOfUserProducts')
				.mockResolvedValue(0);
			jest
				.spyOn(userWishlistRepository, 'getNumberOfUserWishlistProducts')
				.mockResolvedValue(0);
			const getUntappdUserProductsSpy = jest
				.spyOn(untappdService, 'getUserProducts')
				.mockResolvedValue({
					userProducts: mockUserProducts,
					totalUserProducts: mockUserProducts.length,
				});
			const getUserWishlistSpy = jest
				.spyOn(untappdService, 'getUserWishlist')
				.mockResolvedValue({
					wishlistProducts: mockUserWishlistProducts,
					totalWishlistProducts: mockUserWishlistProducts.length,
				});
			const saveUserProductSpy = jest.spyOn(
				userProductRepository,
				'saveUserProduct',
			);
			const saveWishlistProduct = jest.spyOn(
				userWishlistRepository,
				'saveWishlistProduct',
			);

			await userQueueConsumer.processUserQueue(mockJob);

			expect(getUntappdUserProductsSpy).toHaveBeenCalledOnceWith(mockUser1, 0);
			expect(getUserWishlistSpy).toHaveBeenCalledOnceWith(mockUser1, 0);
			expect(saveUserProductSpy).toHaveBeenCalledTimes(mockUserProducts.length);
			expect(saveWishlistProduct).toHaveBeenCalledTimes(
				mockUserWishlistProducts.length,
			);
		});

		it('should delete any removed wishlist', async () => {
			jest.spyOn(userRepository, 'getUser').mockResolvedValue(mockUser1);
			jest
				.spyOn(userProductRepository, 'getNumberOfUserProducts')
				.mockResolvedValue(0);
			jest.spyOn(untappdService, 'getUserProducts').mockResolvedValue({
				userProducts: mockUserProducts,
				totalUserProducts: mockUserProducts.length,
			});
			jest.spyOn(untappdService, 'getUserWishlist').mockResolvedValue({
				wishlistProducts: [mockUserWishlistProduct1, mockUserWishlistProduct3],
				totalWishlistProducts: 2,
			});
			jest
				.spyOn(userWishlistRepository, 'getNumberOfUserWishlistProducts')
				.mockResolvedValue(mockUserWishlistProducts.length);
			jest
				.spyOn(userWishlistRepository, 'getUserWishlistProducts')
				.mockResolvedValue(mockUserWishlistProducts);
			const deleteWishlistProductSpy = jest.spyOn(
				userWishlistRepository,
				'deleteWishlistProduct',
			);

			await userQueueConsumer.processUserQueue(mockJob);

			expect(deleteWishlistProductSpy).toHaveBeenCalledOnceWith(
				mockUserWishlistProduct2.userId,
				mockUserWishlistProduct2.untappdId,
			);
		});

		it('should throw an error if the user has remaining, unsaved products', async () => {
			jest.spyOn(userRepository, 'getUser').mockResolvedValue(mockUser1);
			jest
				.spyOn(userProductRepository, 'getNumberOfUserProducts')
				.mockResolvedValue(0);
			jest.spyOn(untappdService, 'getUserProducts').mockResolvedValue({
				userProducts: mockUserProducts,
				totalUserProducts: 1000,
			});
			jest.spyOn(untappdService, 'getUserWishlist').mockResolvedValue({
				wishlistProducts: [],
				totalWishlistProducts: 0,
			});
			jest
				.spyOn(userWishlistRepository, 'getNumberOfUserWishlistProducts')
				.mockResolvedValue(0);
			jest
				.spyOn(userWishlistRepository, 'getUserWishlistProducts')
				.mockResolvedValue([]);

			await expect(userQueueConsumer.processUserQueue(mockJob)).rejects.toThrow(
				`Did not finish processing user: ${
					1000 - mockUserProducts.length
				} remaining products.`,
			);
		});

		it('should throw an error if the user has remaining, unsaved wishlist products', async () => {
			jest.spyOn(userRepository, 'getUser').mockResolvedValue(mockUser1);
			jest
				.spyOn(userProductRepository, 'getNumberOfUserProducts')
				.mockResolvedValue(0);
			jest.spyOn(untappdService, 'getUserProducts').mockResolvedValue({
				userProducts: [],
				totalUserProducts: 0,
			});
			jest.spyOn(untappdService, 'getUserWishlist').mockResolvedValue({
				wishlistProducts: mockUserWishlistProducts,
				totalWishlistProducts: 50,
			});
			jest
				.spyOn(userWishlistRepository, 'getUserWishlistProducts')
				.mockResolvedValue([]);

			await expect(userQueueConsumer.processUserQueue(mockJob)).rejects.toThrow(
				`Did not finish processing user: ${
					50 - mockUserWishlistProducts.length
				} remaining products.`,
			);
		});
	});
});
