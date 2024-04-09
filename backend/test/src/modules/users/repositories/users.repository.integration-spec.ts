import { DatabaseModule } from '@modules/database/database.module';
import { User } from '@modules/users/entities/user.entity';
import { UserRepository } from '@modules/users/repositories/user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { deepCopyClass } from '@utils/deepCopyClass';
import { postgresClient } from 'test/initIntegrationTestEnvironment';
import { mockUser1, mockUser2, mockUsers } from 'test/mocks/mockUsers';
import { usersShouldMatch } from 'test/utils/testUtils';

describe('userRepository', () => {
	let testingModule: TestingModule;
	let userRepository: UserRepository;

	const insertMockUsers = async () => {
		for (const user of mockUsers) {
			await userRepository.saveUser(user);
		}
	};

	beforeAll(async () => {
		testingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			providers: [UserRepository],
		}).compile();

		userRepository = testingModule.get<UserRepository>(UserRepository);
	});

	afterAll(async () => {
		await testingModule.close();
	});

	afterEach(async () => {
		await postgresClient.query('DELETE FROM users');
	});

	describe('getUser', () => {
		it('should get user by ID', async () => {
			await insertMockUsers();

			const retrievedUser = await userRepository.getUser(mockUser1.id);

			expect(retrievedUser).toMatchUser(retrievedUser);
		});

		it('should return null if user was not found', async () => {
			await insertMockUsers();

			const retrievedUser = await userRepository.getUser('-1');

			expect(retrievedUser).toBeNull();
		});
	});

	describe('getAllUsers', () => {
		it('should get all users', async () => {
			await insertMockUsers();

			const retrievedUsers = await userRepository.getAllUsers();

			usersShouldMatch(retrievedUsers, mockUsers);
		});
	});

	describe('deleteUser', () => {
		it('should delete user', async () => {
			await insertMockUsers();

			await userRepository.deleteUser(mockUser1.id);
			const retrievedUsers = await userRepository.getAllUsers();

			expect(retrievedUsers).toHaveLength(mockUsers.length - 1);
			usersShouldMatch(retrievedUsers, [mockUser2]);
		});
	});

	describe('saveUser', () => {
		it('Should save a new user', async () => {
			await userRepository.saveUser(mockUser1);

			const retrievedUser = await userRepository.getUser(mockUser1.id);

			expect(retrievedUser).toMatchUser(mockUser1);
			expect(retrievedUser?.created).toBeWithinSecondsOfDate(new Date(), 10);
			expect(retrievedUser?.updated).toBeWithinSecondsOfDate(new Date(), 10);
		});
	});

	describe('updateUser', () => {
		it('Should update user and set new updated timestamp', async () => {
			await userRepository.saveUser(mockUser1);

			const updatedUser = deepCopyClass(mockUser1);
			updatedUser.userAvatar = 'https://updated-avatar.test.com';
			updatedUser.accessToken = 'new-and-improved-access-token';

			await userRepository.updateUser(updatedUser);

			const retrievedUser = (await userRepository.getUser(
				mockUser1.id,
			)) as User;
			expect(retrievedUser).toMatchUser(updatedUser);
			expect(retrievedUser?.created).toBeBefore(retrievedUser.updated as Date);
			expect(retrievedUser?.updated).toBeWithinSecondsOfDate(new Date(), 10);
		});
	});
});
