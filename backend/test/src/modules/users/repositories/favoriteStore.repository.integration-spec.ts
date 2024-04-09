import { DatabaseModule } from '@modules/database/database.module';
import { StoresRepository } from '@modules/stores/repositories/stores.repository';
import { FavoriteStore } from '@modules/users/entities/favoriteStore.entity';
import { FavoriteStoreRepository } from '@modules/users/repositories/favoriteStore.repository';
import { UserRepository } from '@modules/users/repositories/user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { postgresClient } from 'test/initIntegrationTestEnvironment';
import { mockStore1, mockStore2, mockStores } from 'test/mocks/mockStores';
import { mockUser1, mockUser2, mockUsers } from 'test/mocks/mockUsers';

describe('favoriteStoreRepository', () => {
	let testingModule: TestingModule;
	let favoriteStoreRepository: FavoriteStoreRepository;
	let storeRepository: StoresRepository;
	let userRepository: UserRepository;

	const insertMockUsers = async () => {
		for (const user of mockUsers) {
			await userRepository.saveUser(user);
		}
	};

	const insertMockStores = async () => {
		for (const store of mockStores) {
			await storeRepository.saveStore(store);
		}
	};

	beforeAll(async () => {
		testingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			providers: [FavoriteStoreRepository, UserRepository, StoresRepository],
		}).compile();

		favoriteStoreRepository = testingModule.get<FavoriteStoreRepository>(
			FavoriteStoreRepository,
		);
		userRepository = testingModule.get<UserRepository>(UserRepository);
		storeRepository = testingModule.get<StoresRepository>(StoresRepository);

		await insertMockStores();
		await insertMockUsers();
	});

	afterAll(async () => {
		await testingModule.close();
	});

	afterEach(async () => {
		await postgresClient.query('DELETE FROM user_favorited_stores');
	});

	describe('saveFavoriteStore', () => {
		it('Can save a new favorite store', async () => {
			const mockFavoriteStore = new FavoriteStore(
				mockUser1.id,
				mockStore1.store_id,
			);

			await favoriteStoreRepository.saveFavoriteStore(mockFavoriteStore);

			const retrievedFavoriteStores =
				await favoriteStoreRepository.getAllFavoriteStoresForUser(mockUser1.id);
			expect(retrievedFavoriteStores).toEqual([mockFavoriteStore]);
		});

		it('Should throw an exception if the user already has that favorite store saved', async () => {
			const mockFavoriteStore = new FavoriteStore(
				mockUser1.id,
				mockStore1.store_id,
			);

			await favoriteStoreRepository.saveFavoriteStore(mockFavoriteStore);

			await expect(
				favoriteStoreRepository.saveFavoriteStore(mockFavoriteStore),
			).rejects.toThrow(
				`User ${mockFavoriteStore.userId} already has a favorite store with id ${mockFavoriteStore.store_id}`,
			);
		});
	});

	describe('getAllFavoriteStoresForUser', () => {
		it('Can get all favorite stores for a user', async () => {
			const mockFavoriteStore1 = new FavoriteStore(
				mockUser1.id,
				mockStore1.store_id,
			);
			const mockFavoriteStore2 = new FavoriteStore(
				mockUser1.id,
				mockStore2.store_id,
			);
			const mockFavoriteStoreForAnotherUser = new FavoriteStore(
				mockUser2.id,
				mockStore1.store_id,
			);
			await favoriteStoreRepository.saveFavoriteStore(mockFavoriteStore1);
			await favoriteStoreRepository.saveFavoriteStore(mockFavoriteStore2);
			await favoriteStoreRepository.saveFavoriteStore(
				mockFavoriteStoreForAnotherUser,
			);

			const retrievedFavoriteStores =
				await favoriteStoreRepository.getAllFavoriteStoresForUser(mockUser1.id);

			expect(retrievedFavoriteStores).toHaveLength(2);
			expect(retrievedFavoriteStores).toContainEqual(mockFavoriteStore1);
			expect(retrievedFavoriteStores).toContainEqual(mockFavoriteStore2);
		});
	});

	describe('getAllFavoriteStoresForUser', () => {
		it('Can get all favorite stores for a user', async () => {
			const mockFavoriteStore = new FavoriteStore(
				mockUser1.id,
				mockStore1.store_id,
			);
			await favoriteStoreRepository.saveFavoriteStore(mockFavoriteStore);

			const retrievedFavoriteStore =
				await favoriteStoreRepository.getFavoriteStore(
					mockUser1.id,
					mockStore1.store_id,
				);

			expect(retrievedFavoriteStore).toEqual(mockFavoriteStore);
		});
	});

	describe('deleteFavoriteStore', () => {
		it('Can delete a favorite store', async () => {
			const mockFavoriteStore1 = new FavoriteStore(
				mockUser1.id,
				mockStore1.store_id,
			);
			const mockFavoriteStore2 = new FavoriteStore(
				mockUser1.id,
				mockStore2.store_id,
			);
			await favoriteStoreRepository.saveFavoriteStore(mockFavoriteStore1);
			await favoriteStoreRepository.saveFavoriteStore(mockFavoriteStore2);

			await favoriteStoreRepository.deleteFavoriteStore(
				mockUser1.id,
				mockStore1.store_id,
			);

			const retrievedFavoriteStores =
				await favoriteStoreRepository.getAllFavoriteStoresForUser(mockUser1.id);

			expect(retrievedFavoriteStores).toHaveLength(1);
			expect(retrievedFavoriteStores).toContainEqual(mockFavoriteStore2);
		});
	});
});
