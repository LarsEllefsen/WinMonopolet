import { DatabaseModule } from '@modules/database/database.module';
import { UserRepository } from '@modules/users/repositories/user.repository';
import { UserProductsRepository } from '@modules/users/repositories/userProducts.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { postgresClient } from 'test/initIntegrationTestEnvironment';
import {
	mockUserProduct1,
	mockUserProducts,
} from 'test/mocks/mockUserProducts';
import { mockUser1, mockUsers } from 'test/mocks/mockUsers';
import { userProductsShouldMatch } from 'test/utils/testUtils';

describe('favoriteStoreRepository', () => {
	let testingModule: TestingModule;
	let userProductRepository: UserProductsRepository;
	let userRepository: UserRepository;

	const insertMockUsers = async () => {
		for (const user of mockUsers) {
			await userRepository.saveUser(user);
		}
	};

	const inserMockUserProducts = async () => {
		for (const userProduct of mockUserProducts) {
			await userProductRepository.saveUserProduct(userProduct);
		}
	};

	beforeAll(async () => {
		testingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			providers: [UserRepository, UserProductsRepository],
		}).compile();

		userProductRepository = testingModule.get<UserProductsRepository>(
			UserProductsRepository,
		);
		userRepository = testingModule.get<UserRepository>(UserRepository);

		await insertMockUsers();
	});

	afterAll(async () => {
		await postgresClient.query('DELETE FROM users');
		await testingModule.close();
	});

	afterEach(async () => {
		await postgresClient.query('DELETE FROM user_products');
	});

	describe('saveUserProduct', () => {
		it('should save user product', async () => {
			await userProductRepository.saveUserProduct(mockUserProduct1);

			const retrievedUserProducts = await userProductRepository.getUserProducts(
				mockUser1.id,
			);
			expect(retrievedUserProducts).toHaveLength(1);
			expect(retrievedUserProducts).toContainEqual(mockUserProduct1);
		});

		it('should ignore duplicate user products', async () => {
			await userProductRepository.saveUserProduct(mockUserProduct1);
			await userProductRepository.saveUserProduct(mockUserProduct1);

			const retrievedUserProducts = await userProductRepository.getUserProducts(
				mockUser1.id,
			);
			expect(retrievedUserProducts).toHaveLength(1);
			expect(retrievedUserProducts).toContainEqual(mockUserProduct1);
		});
	});

	describe('getUserProducts', () => {
		it('should return all userProducts for the given user', async () => {
			await inserMockUserProducts();

			const retrievedUserProducts = await userProductRepository.getUserProducts(
				mockUser1.id,
			);

			expect(retrievedUserProducts).toHaveLength(mockUserProducts.length);
			userProductsShouldMatch(retrievedUserProducts, mockUserProducts);
		});
	});
});
