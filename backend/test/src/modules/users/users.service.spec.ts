import { TestBed } from '@automock/jest';
import { APILimitReachedException } from '@exceptions/APILimitReachedException';
import { StoresService } from '@modules/stores/stores.service';
import { UntappdService } from '@modules/untappd/untappd.service';
import { FavoriteStore } from '@modules/users/entities/favoriteStore.entity';
import { FavoriteStoreRepository } from '@modules/users/repositories/favoriteStore.repository';
import { UserRepository } from '@modules/users/repositories/user.repository';
import { UsersService } from '@modules/users/users.service';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { mockStore1 } from 'test/mocks/mockStores';
import { mockUntappdUser1, mockUser1, mockUsers } from 'test/mocks/mockUsers';

describe('userService', () => {
	let userService: UsersService;
	let userRepository: UserRepository;
	let untappdService: UntappdService;
	let userQueue: Queue<any>;
	let storeService: StoresService;
	let favoriteStoreRepository: FavoriteStoreRepository;

	beforeAll(() => {
		const { unit, unitRef } = TestBed.create(UsersService).compile();

		userService = unit;
		userRepository = unitRef.get(UserRepository);
		untappdService = unitRef.get(UntappdService);
		userQueue = unitRef.get(getQueueToken('user'));
		storeService = unitRef.get(StoresService);
		favoriteStoreRepository = unitRef.get(FavoriteStoreRepository);
	});

	describe('getAuthenticatedUser', () => {
		it('can get user by userId', async () => {
			const getUserSpy = jest
				.spyOn(userRepository, 'getUser')
				.mockResolvedValue(mockUser1);

			const authenciatedUser = await userService.getAuthenticatedUser(
				mockUser1.id,
				mockUser1.accessToken,
			);

			expect(authenciatedUser).toMatchUser(mockUser1);
			expect(getUserSpy).toBeCalledTimes(1);
			expect(getUserSpy).toHaveBeenCalledWith(mockUser1.id);
		});

		it('can get user by authencation token if userId is null', async () => {
			const getAllUsersSpy = jest
				.spyOn(userRepository, 'getAllUsers')
				.mockResolvedValue(mockUsers);

			const authenciatedUser = await userService.getAuthenticatedUser(
				null,
				mockUser1.accessToken,
			);

			expect(authenciatedUser).toMatchUser(mockUser1);
			expect(getAllUsersSpy).toBeCalledTimes(1);
		});

		it('throws NotFoundException if no user was found', async () => {
			jest.spyOn(userRepository, 'getUser').mockResolvedValue(null);

			await expect(
				userService.getAuthenticatedUser('-1', mockUser1.accessToken),
			).rejects.toThrow('No authenticated user found');
		});
	});

	describe('saveUser', () => {
		it('should save a new user if does not already exist', async () => {
			const getUserInfoSpy = jest
				.spyOn(untappdService, 'getUserInfo')
				.mockResolvedValue(mockUntappdUser1);
			const getUserSpy = jest
				.spyOn(userRepository, 'getUser')
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce(mockUser1);
			const saveUserSpy = jest.spyOn(userRepository, 'saveUser');

			const savedUser = await userService.saveUser(mockUser1.accessToken);

			expect(savedUser).toMatchUser(mockUser1);
			expect(getUserInfoSpy).toHaveBeenCalledOnceWith(mockUser1.accessToken);
			expect(getUserSpy).toHaveBeenCalledWith(mockUntappdUser1.id);
			expect(saveUserSpy).toHaveBeenCalledOnce;
		});

		it('should update existing user if it already exists', async () => {
			const getUserInfoSpy = jest
				.spyOn(untappdService, 'getUserInfo')
				.mockResolvedValue(mockUntappdUser1);
			const getUserSpy = jest
				.spyOn(userRepository, 'getUser')
				.mockResolvedValue(mockUser1);
			const updateUserSpy = jest.spyOn(userRepository, 'updateUser');

			const savedUser = await userService.saveUser(mockUser1.accessToken);

			expect(savedUser).toMatchUser(mockUser1);
			expect(getUserInfoSpy).toHaveBeenCalledOnceWith(mockUser1.accessToken);
			expect(getUserSpy).toHaveBeenCalledWith(mockUntappdUser1.id);
			expect(updateUserSpy).toHaveBeenCalledOnce;
		});

		it('should get user by access token if untappd api limit is reached', async () => {
			jest
				.spyOn(untappdService, 'getUserInfo')
				.mockRejectedValue(new APILimitReachedException());
			const getAuthenticatedUserSpy = jest
				.spyOn(userService, 'getAuthenticatedUser')
				.mockResolvedValue(mockUser1);

			const savedUser = await userService.saveUser(mockUser1.accessToken);

			expect(savedUser).toMatchUser(mockUser1);
			expect(getAuthenticatedUserSpy).toHaveBeenCalledWith(
				null,
				mockUser1.accessToken,
			);
		});
	});

	describe('addUserToQueue', () => {
		it('should add user to the queue', async () => {
			const adduserToQueueSpy = jest.spyOn(userQueue, 'add');

			await userService.addUserToQueue(mockUser1.id);

			expect(adduserToQueueSpy).toHaveBeenCalledOnceWith({
				userId: mockUser1.id,
			});
		});
	});

	describe('addFavoriteStore', () => {
		it('addFavoriteStore', async () => {
			jest.spyOn(userRepository, 'getUser').mockResolvedValue(mockUser1);
			jest.spyOn(storeService, 'getStore').mockResolvedValue(mockStore1);
			const favoriteStoreRepositorySpy = jest.spyOn(
				favoriteStoreRepository,
				'saveFavoriteStore',
			);

			await userService.addFavoriteStore(mockUser1.id, mockStore1.store_id);

			expect(favoriteStoreRepositorySpy).toHaveBeenCalledOnceWith(
				new FavoriteStore(mockUser1.id, mockStore1.store_id),
			);
		});

		it('should throw NotFoundException if user was not found', async () => {
			jest.spyOn(userRepository, 'getUser').mockResolvedValue(null);

			await expect(
				userService.addFavoriteStore(mockUser1.id, mockStore1.store_id),
			).rejects.toThrow(`No user with id ${mockUser1.id} found`);
		});
	});

	describe('removeFavoriteStore', () => {
		it('should remove a favorite store from the user', async () => {
			const mockFavoriteStore = new FavoriteStore(
				mockUser1.id,
				mockStore1.store_id,
			);
			jest.spyOn(userRepository, 'getUser').mockResolvedValue(mockUser1);
			jest
				.spyOn(favoriteStoreRepository, 'getFavoriteStore')
				.mockResolvedValue(mockFavoriteStore);
			const deleteFavoriteStoreSpy = jest.spyOn(
				favoriteStoreRepository,
				'deleteFavoriteStore',
			);

			await userService.removeFavoriteStore(mockUser1.id, mockStore1.store_id);

			expect(deleteFavoriteStoreSpy).toHaveBeenCalledOnceWith(
				mockUser1.id,
				mockStore1.store_id,
			);
		});
	});

	describe('deleteUser', () => {
		it('should delete the user', async () => {
			jest.spyOn(userRepository, 'getUser').mockResolvedValue(mockUser1);
			const deleteUserSpy = jest.spyOn(userRepository, 'deleteUser');

			await userService.deleteUser(mockUser1.id);

			expect(deleteUserSpy).toHaveBeenCalledOnceWith(mockUser1.id);
		});
	});
});
