import { DatabaseModule } from '@modules/database/database.module';
import { UserWishlistProduct } from '@modules/users/entities/userWishlistProduct.entity';
import { UserRepository } from '@modules/users/repositories/user.repository';
import { UserWishlistRepository } from '@modules/users/repositories/userWishlist.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { postgresClient } from 'test/initIntegrationTestEnvironment';
import {
	mockUserWishlistProduct1,
	mockUserWishlistProduct3,
	mockUserWishlistProducts,
} from 'test/mocks/mockUserProducts';
import { mockUser1, mockUsers } from 'test/mocks/mockUsers';
import { userWishlistProductsShouldMatch } from 'test/utils/testUtils';

describe('userWishlistRepository', () => {
	let testingModule: TestingModule;
	let userWishlistRepository: UserWishlistRepository;
	let userRepository: UserRepository;

	const insertMockUsers = async () => {
		for (const user of mockUsers) {
			await userRepository.saveUser(user);
		}
	};

	const inserMockWishlistProducts = async () => {
		for (const mockWishlistProduct of mockUserWishlistProducts) {
			await userWishlistRepository.saveWishlistProduct(mockWishlistProduct);
		}
	};

	beforeAll(async () => {
		testingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			providers: [UserRepository, UserWishlistRepository],
		}).compile();

		userWishlistRepository = testingModule.get<UserWishlistRepository>(
			UserWishlistRepository,
		);
		userRepository = testingModule.get<UserRepository>(UserRepository);

		await insertMockUsers();
	});

	afterAll(async () => {
		await postgresClient.query('DELETE FROM users');
		await testingModule.close();
	});

	afterEach(async () => {
		await postgresClient.query('DELETE FROM user_wishlist_products');
	});

	describe('saveWishlistProduct', () => {
		it('should save user wishlist product', async () => {
			const mockUserWishlistProduct = new UserWishlistProduct(
				mockUser1.id,
				'test_untappd_product',
				undefined,
			);

			await userWishlistRepository.saveWishlistProduct(mockUserWishlistProduct);

			const retrievedUserProducts =
				await userWishlistRepository.getUserWishlistProducts(mockUser1.id);
			expect(retrievedUserProducts).toHaveLength(1);
		});

		it('should ignore any existing products', async () => {
			const mockUserWishlistProduct = new UserWishlistProduct(
				mockUser1.id,
				'test_untappd_product',
				undefined,
			);

			await userWishlistRepository.saveWishlistProduct(mockUserWishlistProduct);
			await userWishlistRepository.saveWishlistProduct(mockUserWishlistProduct);

			const retrievedUserProducts =
				await userWishlistRepository.getUserWishlistProducts(mockUser1.id);
			expect(retrievedUserProducts).toHaveLength(1);
		});
	});

	describe('getUserWishlistProducts', () => {
		it('should get all products for the given user', async () => {
			await inserMockWishlistProducts();

			const retrievedUserWishlistProducts =
				await userWishlistRepository.getUserWishlistProducts(mockUser1.id);
			expect(retrievedUserWishlistProducts).toHaveLength(2);
			userWishlistProductsShouldMatch(retrievedUserWishlistProducts, [
				mockUserWishlistProduct1,
				mockUserWishlistProduct3,
			]);
		});
	});

	describe('getNumberOfUserWishlistProducts', () => {
		it('should count number of saved wishlist products for the given user', async () => {
			await inserMockWishlistProducts();

			const numberOfSavesWishlistProducts =
				await userWishlistRepository.getNumberOfUserWishlistProducts(
					mockUser1.id,
				);
			expect(numberOfSavesWishlistProducts).toEqual(2);
		});

		it('should handle users without any products', async () => {
			const numberOfSavesWishlistProducts =
				await userWishlistRepository.getNumberOfUserWishlistProducts(
					mockUser1.id,
				);
			expect(numberOfSavesWishlistProducts).toEqual(0);
		});
	});
});
