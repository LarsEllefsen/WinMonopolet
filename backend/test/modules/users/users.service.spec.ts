import { APILimitReachedException } from '@exceptions/APILimitReachedException';
import { StoresModule } from '@modules/stores/stores.module';
import { FavoriteStore } from '@modules/users/entities/favoriteStore.entity';
import { User } from '@modules/users/entities/user.entity';
import { UserProduct } from '@modules/users/entities/userProduct.entity';
import { UsersService } from '@modules/users/users.service';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { UntappdService } from '@modules/untappd/untappd.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { createMockUser } from 'test/utils/mockData';
import setupTestDatabase from 'test/utils/setupTestDatabase';
import { Repository } from 'typeorm';
import { UserNotification } from '@modules/users/entities/userNotification.entity';

const moduleMocker = new ModuleMocker(global);

const USER_ID = '1234';
const ACCESS_TOKEN = 'accesstoken';
const SALT = Buffer.from('16_bytes_salt_00');

describe('Users service', () => {
	let service: UsersService;
	let userRepository: Repository<User>;
	let userProductsRepository: Repository<UserProduct>;
	let untappdService: UntappdService;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				setupTestDatabase,
				TypeOrmModule.forFeature([User]),
				TypeOrmModule.forFeature([UserProduct]),
				TypeOrmModule.forFeature([FavoriteStore]),
				TypeOrmModule.forFeature([UserNotification]),
			],
			providers: [
				UsersService,
				{
					provide: getQueueToken('user'),
					useValue: { add: jest.fn(), process: jest.fn() },
				},
			],
		})
			.useMocker((token) => {
				const mockMetadata = moduleMocker.getMetadata(
					token,
				) as MockFunctionMetadata<any, any>;
				const Mock = moduleMocker.generateFromMetadata(mockMetadata);
				return new Mock();
			})
			.overrideProvider(getQueueToken('user'))
			.useValue({})
			.compile();

		service = module.get<UsersService>(UsersService);
		userRepository = module.get<Repository<User>>(getRepositoryToken(User));
		userProductsRepository = module.get<Repository<UserProduct>>(
			getRepositoryToken(UserProduct),
		);
		untappdService = module.get<UntappdService>(UntappdService);
	});

	afterEach(async () => {
		await userProductsRepository.clear();
		await userRepository.clear();
		jest.resetAllMocks();
	});

	describe('saveUser', () => {
		it('should save a new user', async () => {
			jest.spyOn(untappdService, 'getUserInfo').mockResolvedValue(
				createMockUser({
					accessToken: ACCESS_TOKEN,
					id: USER_ID,
					userName: 'BeerMan',
					created: new Date(),
				}),
			);

			const savedUser = await service.saveUser(ACCESS_TOKEN);

			expect(savedUser.id).toBe(USER_ID);
			expect(savedUser.accessToken).toBe(ACCESS_TOKEN);
			expect(savedUser.userName).toBe('BeerMan');
		});

		it('should update existing user', async () => {
			const mockUser = createMockUser({
				id: USER_ID,
				accessToken: ACCESS_TOKEN,
				salt: SALT,
				totalBeers: 50,
				userAvatar: 'https://www.user-avatar.com',
			});
			const updatedToken = 'new_access_token';
			jest.spyOn(untappdService, 'getUserInfo').mockResolvedValue(
				createMockUser({
					id: USER_ID,
					userAvatar: 'https://www.new-user-avatar.com',
				}),
			);
			await userRepository.insert(mockUser);

			const savedUser = await service.saveUser(updatedToken);

			expect(savedUser.id).toBe(USER_ID);
			expect(savedUser.userAvatar).toBe('https://www.new-user-avatar.com');
			expect(savedUser.accessToken).toBe(updatedToken);
			expect(savedUser.salt).toStrictEqual(SALT);
		});

		it('If getUserInfo throws APILimitReachedException, return any existing user', async () => {
			jest.spyOn(untappdService, 'getUserInfo').mockImplementation(() => {
				throw new APILimitReachedException();
			});
			const mockUser = createMockUser({
				id: USER_ID,
				accessToken: ACCESS_TOKEN,
			});
			await userRepository.insert(mockUser);

			const savedUser = await service.saveUser(ACCESS_TOKEN);

			expect(savedUser.id).toBe(USER_ID);
		});
	});

	describe('getAuthenticatedUser', () => {
		it('should find user by Id if UserId is set in UserContext', async () => {
			const mockUser = createMockUser({
				id: USER_ID,
				accessToken: ACCESS_TOKEN,
			});
			await userRepository.save(mockUser);

			const userFoundById = await service.getAuthenticatedUser(
				USER_ID,
				ACCESS_TOKEN,
			);

			expect(userFoundById.id).toBe(USER_ID);
		});

		it('should find user by accessToken if no UserId is set in UserContext ', async () => {
			const mockUser = createMockUser({
				id: USER_ID,
				accessToken: ACCESS_TOKEN,
			});
			await userRepository.save(mockUser);

			const userFoundById = await service.getAuthenticatedUser(
				USER_ID,
				ACCESS_TOKEN,
			);

			expect(userFoundById.id).toBe(USER_ID);
			expect(userFoundById.accessToken).toBe(ACCESS_TOKEN);
		});
	});
});
