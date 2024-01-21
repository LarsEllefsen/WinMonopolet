import { User } from "@modules/users/entities/user.entity";
import { UserProduct } from "@modules/users/entities/userProduct.entity";
import { UserWishlistProduct } from "@modules/users/entities/userWishlistProduct.entity";
import { UserQueueConsumer } from "@modules/users/providers/userQueue.consumer";
import { UsersService } from "@modules/users/users.service";
import { getQueueToken } from "@nestjs/bull";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule, getRepositoryToken } from "@nestjs/typeorm";
import { UntappdService } from "@modules/untappd/untappd.service";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { createMockUser } from "test/utils/mockData";
import setupTestDatabase from "test/utils/setupTestDatabase";
import { In, Not, Repository } from "typeorm";

const moduleMocker = new ModuleMocker(global);

const USER_ID = "1234";
const ACCESS_TOKEN = "accesstoken";
const SALT = Buffer.from("16_bytes_salt_00");

describe("Users service", () => {
  let userQueueConsumer: UserQueueConsumer;
  let userRepository: Repository<User>;
  let userProductsRepository: Repository<UserProduct>;
  let userWishlistProductsRepository: Repository<UserWishlistProduct>;
  let untappdService: UntappdService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        setupTestDatabase,
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([UserProduct]),
        TypeOrmModule.forFeature([UserWishlistProduct]),
      ],
      providers: [
        UserQueueConsumer,
        {
          provide: UsersService,
          useValue: { getUserById: jest.fn() },
        },
        {
          provide: getQueueToken("user"),
          useValue: { add: jest.fn(), process: jest.fn() },
        },
      ],
    })
      .useMocker((token) => {
        if (token === UntappdService) {
          const mockMetadata = moduleMocker.getMetadata(
            token
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .overrideProvider(getQueueToken("user"))
      .useValue({})
      .compile();

    userQueueConsumer = module.get<UserQueueConsumer>(UserQueueConsumer);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userProductsRepository = module.get<Repository<UserProduct>>(
      getRepositoryToken(UserProduct)
    );
    userWishlistProductsRepository = module.get<
      Repository<UserWishlistProduct>
    >(getRepositoryToken(UserWishlistProduct));
    untappdService = module.get<UntappdService>(UntappdService);
  });

  afterEach(async () => {
    await userProductsRepository.clear();
    await userWishlistProductsRepository.clear();
    await userRepository.clear();
    jest.resetAllMocks();
  });

  describe("queue consumer", () => {
    it("asd", async () => {
      const mockUser1 = createMockUser({ id: "lars" });
      const mockUser2 = createMockUser({ id: "testmann" });
      await userRepository.insert([mockUser1, mockUser2]);

      const testmannProduct = new UserWishlistProduct();
      testmannProduct.untappdId = "789";
      testmannProduct.userId = "testmann";

      const userWishlistProduct1 = new UserWishlistProduct();
      userWishlistProduct1.untappdId = "123";
      userWishlistProduct1.userId = "lars";

      const userWishlistProduct2 = new UserWishlistProduct();
      userWishlistProduct2.untappdId = "321";
      userWishlistProduct2.userId = "lars";

      const userWishlistProduct3 = new UserWishlistProduct();
      userWishlistProduct3.untappdId = "789";
      userWishlistProduct3.userId = "lars";

      await userWishlistProductsRepository.insert([
        userWishlistProduct1,
        userWishlistProduct2,
        userWishlistProduct3,
        testmannProduct,
      ]);

      await userWishlistProductsRepository.upsert(userWishlistProduct3, {
        conflictPaths: ["userId", "untappdId"],
        skipUpdateIfNoValuesChanged: true,
      });

      expect(await userWishlistProductsRepository.count()).toBe(4);
      expect(
        await userWishlistProductsRepository.countBy({ userId: "lars" })
      ).toBe(3);
      expect(
        await userWishlistProductsRepository.countBy({ userId: "testmann" })
      ).toBe(1);

      const notToBeDeleted = [userWishlistProduct1, userWishlistProduct2];
      const shouldBeDeleted = await userWishlistProductsRepository.findBy({
        untappdId: Not(In(notToBeDeleted.map((x) => x.untappdId))),
        userId: "lars",
      });

      expect(shouldBeDeleted).toHaveLength(1);
      expect(shouldBeDeleted[0].untappdId).toBe(userWishlistProduct3.untappdId);
      await userWishlistProductsRepository.remove(shouldBeDeleted);

      expect(await userWishlistProductsRepository.count()).toBe(3);
    });
  });
});
