import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from '@modules/stores/entities/stock.entity';
import { Store } from '@modules/stores/entities/stores.entity';
import { StoresService } from '@modules/stores/stores.service';
import { Repository } from 'typeorm';
import {
	createMockStock,
	createMockStore,
	createMockVinmonopoletProductWithStockLevel,
} from '../../utils/mockData';
import setupTestDatabase from 'test/utils/setupTestDatabase';
import {
	createMockUntappdProduct,
	createMockVinmonopoletProduct,
} from 'test/utils/mockData';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { VinmonopoletService } from '@modules/vinmonopolet/vinmonopolet.service';
import { ProductsService } from '@modules/products/products.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('StoresService', () => {
	let service: StoresService;
	let productsService: ProductsService;
	let vinmonopoletService: VinmonopoletService;
	let stockRepository: Repository<Stock>;
	let storeRepository: Repository<Store>;
	let productsRepository: Repository<VinmonopoletProduct>;
	let untappdRepository: Repository<UntappdProduct>;

	const paragonVmpId = '14962702';
	const noaVmpId = '14540402';
	const slamDunkVmpId = '13956302';

	const noaUntappdId = '4831129';
	const paragonUntappdId = '5072941';
	const slamDunkUntappdId = '3718058';

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				setupTestDatabase,
				TypeOrmModule.forFeature([Store]),
				TypeOrmModule.forFeature([Stock]),
				TypeOrmModule.forFeature([VinmonopoletProduct]),
				TypeOrmModule.forFeature([UntappdProduct]),
			],
			providers: [StoresService],
		})
			.useMocker((token) => {
				const mockMetadata = moduleMocker.getMetadata(
					token,
				) as MockFunctionMetadata<any, any>;
				const Mock = moduleMocker.generateFromMetadata(mockMetadata);
				return new Mock();
			})
			.compile();

		service = module.get<StoresService>(StoresService);
		productsService = module.get<ProductsService>(ProductsService);
		vinmonopoletService = module.get<VinmonopoletService>(VinmonopoletService);
		stockRepository = module.get<Repository<Stock>>(getRepositoryToken(Stock));
		storeRepository = module.get<Repository<Store>>(getRepositoryToken(Store));
		productsRepository = module.get<Repository<VinmonopoletProduct>>(
			getRepositoryToken(VinmonopoletProduct),
		);
		untappdRepository = module.get<Repository<UntappdProduct>>(
			getRepositoryToken(UntappdProduct),
		);
	});

	afterEach(async () => {
		await stockRepository.clear();
		await storeRepository.clear();
		await untappdRepository.clear();
		await productsRepository.clear();
		jest.resetAllMocks();
	});

	it('findAllStores should return all stores in the database ', async () => {
		const testStoreTrondheim = createMockStore({
			name: 'Trondheim, Trondheim Torg',
			formatted_name: 'trondheim_trondheim_torg',
			store_id: '160',
		});
		const testStoreOslo = createMockStore({
			name: 'Oslo, Oslo City',
			formatted_name: 'oslo_oslo_city',
			store_id: '143',
		});
		await storeRepository.save([testStoreTrondheim, testStoreOslo]);

		const allStores = await service.getAllStores();

		expect(allStores).toHaveLength(2);
		expect(allStores).toContainEqual(testStoreOslo);
		expect(allStores).toContainEqual(testStoreTrondheim);
	});

	it('getStockForStore should return all products in stock for a given store', async () => {
		const testStore1 = createMockStore({ store_id: '160' });
		const testStore2 = createMockStore({ store_id: '240' });
		const testProduct1 = createMockVinmonopoletProduct({
			vmp_id: paragonVmpId,
			vmp_name: 'Lervig Paragon Bourbon Barrel 2021',
			untappd: createMockUntappdProduct({
				untappd_id: paragonUntappdId,
				vmp_id: paragonVmpId,
				untappd_name: 'Paragon 2021 By Rackhouse',
			}),
		});
		const testProduct2 = createMockVinmonopoletProduct({
			vmp_id: noaVmpId,
			vmp_name: 'Omnipollo Noa Bourbon Barrel Aged Imperial Stout 2022',
			untappd: createMockUntappdProduct({
				untappd_id: noaUntappdId,
				vmp_id: noaVmpId,
				untappd_name: 'Noa Pecan Mud Cake Stout (Bourbon Barrel Aged) (2022)',
			}),
		});
		const testProduct3 = createMockVinmonopoletProduct({
			vmp_id: slamDunkVmpId,
			vmp_name: 'Salikatt Slam Dunk',
			untappd: createMockUntappdProduct({
				untappd_id: slamDunkUntappdId,
				vmp_id: slamDunkVmpId,
				untappd_name: 'Salikatt Slam Dunk',
			}),
		});
		const testStock1 = createMockStock({
			store: testStore1,
			product: testProduct1,
		});
		const testStock2 = createMockStock({
			store: testStore1,
			product: testProduct2,
		});
		const testStock3 = createMockStock({
			store: testStore2,
			product: testProduct3,
		});
		await storeRepository.save([testStore1, testStore2]);
		await productsRepository.save([testProduct1, testProduct2, testProduct3]);
		await stockRepository.save([testStock1, testStock2, testStock3]);

		const allStockForStore = await service.getStockForStore(testStore1);
		expect(allStockForStore).toHaveLength(2);
		expect(allStockForStore).toSatisfyAny(
			({ product }: Stock) =>
				product.vmp_id === paragonVmpId &&
				product.untappd?.untappd_id === paragonUntappdId,
		);
		expect(allStockForStore).not.toSatisfyAny(
			({ product }: Stock) =>
				product.vmp_id === slamDunkVmpId &&
				product.untappd?.untappd_id === slamDunkUntappdId,
		);
	});

	it('getStockForStore should only return products with an associated untappd product', async () => {
		const testStore = createMockStore({ store_id: '160' });
		const testProduct1 = createMockVinmonopoletProduct({
			vmp_id: paragonVmpId,
			vmp_name: 'Lervig Paragon Bourbon Barrel 2021',
			untappd: createMockUntappdProduct({
				untappd_id: paragonUntappdId,
				vmp_id: paragonVmpId,
				untappd_name: 'Paragon 2021 By Rackhouse',
			}),
		});
		const testProduct2 = createMockVinmonopoletProduct({
			vmp_id: noaVmpId,
			vmp_name: 'Omnipollo Noa Bourbon Barrel Aged Imperial Stout 2022',
		});
		testProduct2.untappd = undefined;
		const testStock1 = createMockStock({
			store: testStore,
			product: testProduct1,
		});
		const testStock2 = createMockStock({
			store: testStore,
			product: testProduct2,
		});
		await storeRepository.save([testStore]);
		await productsRepository.save([testProduct1, testProduct2]);
		await stockRepository.save([testStock1, testStock2]);

		const allStockForStore = await service.getStockForStore(testStore);

		expect(allStockForStore).toHaveLength(1);
		expect(allStockForStore[0].product.vmp_id).toBe(paragonVmpId);
	});

	it('getStore should throw 404 if the store does not exist', async () => {
		expect(service.getStore('does not exist')).toReject();
	});

	it('getStore should return store if it exists', async () => {
		const mockStore = createMockStore({ store_id: '160' });
		await storeRepository.save(mockStore);

		const store = await service.getStore('160');

		expect(store).not.toBeNull;
		expect(store.store_id).toBe('160');
	});

	describe('updateStockForStore', () => {
		it('should delete the existing stock and replace it with the new, updated stock', async () => {
			const testStore = createMockStore({ store_id: '160' });
			const testProduct = createMockVinmonopoletProduct({
				vmp_id: paragonVmpId,
				vmp_name: 'Lervig Paragon Bourbon Barrel 2021',
				untappd: createMockUntappdProduct({
					untappd_id: paragonUntappdId,
					vmp_id: paragonVmpId,
					untappd_name: 'Paragon 2021 By Rackhouse',
				}),
			});
			const testProduct2 = createMockVinmonopoletProduct({
				vmp_id: noaVmpId,
				vmp_name: 'Omnipollo Noa Bourbon Barrel Aged Imperial Stout 2022',
				untappd: createMockUntappdProduct({
					untappd_id: noaUntappdId,
					vmp_id: noaVmpId,
					untappd_name: 'Noa Pecan Mud Cake Stout (Bourbon Barrel Aged) (2022)',
				}),
			});
			const testStock = createMockStock({
				store: testStore,
				product: testProduct,
			});
			await storeRepository.save([testStore]);
			await productsRepository.save([testProduct, testProduct2]);
			await stockRepository.save([testStock]);
			jest
				.spyOn(productsService, 'getProductsByStore')
				.mockImplementation(() => {
					return Promise.resolve([
						createMockVinmonopoletProductWithStockLevel({
							vinmonopoletProduct: testProduct2,
						}),
					]);
				});

			await service.updateStockForStore(testStore);
			const stockForStore = await service.getStockForStore(testStore);

			expect(stockForStore).toHaveLength(1);
			expect(stockForStore[0].product.vmp_id).toBe(noaVmpId);
		});

		it('should roll back transaction if an exception is thrown', async () => {
			const testStore = createMockStore({ store_id: '160' });
			const testProduct = createMockVinmonopoletProduct({
				vmp_id: paragonVmpId,
				vmp_name: 'Lervig Paragon Bourbon Barrel 2021',
				untappd: createMockUntappdProduct({
					untappd_id: paragonUntappdId,
					vmp_id: paragonVmpId,
					untappd_name: 'Paragon 2021 By Rackhouse',
				}),
			});
			const testProduct2 = createMockVinmonopoletProduct({
				vmp_id: noaVmpId,
				vmp_name: 'Omnipollo Noa Bourbon Barrel Aged Imperial Stout 2022',
				untappd: createMockUntappdProduct({
					untappd_id: noaUntappdId,
					vmp_id: noaVmpId,
					untappd_name: 'Noa Pecan Mud Cake Stout (Bourbon Barrel Aged) (2022)',
				}),
			});
			const testProduct3 = createMockVinmonopoletProduct({
				vmp_id: '15718202',
				vmp_name: 'Verdant Light Through the Veins DIPA',
				untappd: createMockUntappdProduct({
					untappd_id: '5322002',
					vmp_id: '15718202',
					untappd_name: 'Light Through the Veins',
				}),
			});
			const testStock = createMockStock({
				store: testStore,
				product: testProduct,
				stock_level: 100,
			});
			const testStock2 = createMockStock({
				store: testStore,
				product: testProduct2,
				stock_level: 50,
			});
			const testStock3 = createMockStock({
				store: testStore,
				product: testProduct3,
				stock_level: 200,
			});
			await storeRepository.save([testStore]);
			await productsRepository.save([testProduct, testProduct2, testProduct3]);
			await stockRepository.save([testStock, testStock2, testStock3]);
			testProduct3.vmp_id = '-1';
			jest.spyOn(productsService, 'getProductsByStore').mockResolvedValue([
				createMockVinmonopoletProductWithStockLevel({
					stockLevel: 49,
					vinmonopoletProduct: testProduct,
				}),
				createMockVinmonopoletProductWithStockLevel({
					stockLevel: 150,
					vinmonopoletProduct: testProduct3,
				}),
			]);

			await expect(service.updateStockForStore(testStore)).rejects.toThrow();
			const allStockForStore = await stockRepository.find({
				relations: { product: true },
			});

			expect(allStockForStore).toHaveLength(3);
			expect(allStockForStore).toSatisfyAny(
				(stock: Stock) =>
					stock.product.vmp_id === paragonVmpId && stock.stock_level === 100,
			);
		});
	});

	describe('updateStockForAllStores', () => {
		it('calls updateStockForStore for every store', async () => {
			const mockStore1 = createMockStore({ store_id: '1', name: 'Store 1' });
			const mockStore2 = createMockStore({ store_id: '2', name: 'Store 2' });
			const mockStore3 = createMockStore({ store_id: '3', name: 'Store 3' });
			jest
				.spyOn(service, 'getAllStores')
				.mockResolvedValue([mockStore1, mockStore2, mockStore3]);
			const updateStockForStoreSpy = jest
				.spyOn(service, 'updateStockForStore')
				.mockResolvedValue();

			await service.updateStockForAllStores();

			expect(updateStockForStoreSpy).toHaveBeenCalledTimes(3);
		});

		it('should update which products are active or not based on the newly updated stock', async () => {
			const mockStore = createMockStore({ store_id: '1', name: 'Store 1' });

			const mockProduct1 = createMockVinmonopoletProduct({
				vmp_id: '1',
				active: 1,
			});
			const mockProduct2 = createMockVinmonopoletProduct({
				vmp_id: '2',
				active: 1,
			});
			const mockProduct3 = createMockVinmonopoletProduct({
				vmp_id: '3',
				active: 1,
			});

			const mockActiveProduct1 = createMockVinmonopoletProductWithStockLevel({
				vinmonopoletProduct: mockProduct1,
			});
			const mockActiveProduct3 = createMockVinmonopoletProductWithStockLevel({
				vinmonopoletProduct: mockProduct3,
			});

			jest
				.spyOn(productsService, 'getProductsByStore')
				.mockResolvedValue([mockActiveProduct1, mockActiveProduct3]);

			await storeRepository.save(mockStore);
			await productsRepository.save([mockProduct1, mockProduct2, mockProduct3]);

			await service.updateStockForAllStores();

			const allProducts = await productsRepository.find();

			expect(allProducts).toHaveLength(3);
			expect(allProducts).toSatisfyAny(
				(product: VinmonopoletProduct) =>
					product.vmp_id === '1' && product.active === 1,
			);
			expect(allProducts).toSatisfyAny(
				(product: VinmonopoletProduct) =>
					product.vmp_id === '2' && product.active === 0,
			);
			expect(allProducts).toSatisfyAny(
				(product: VinmonopoletProduct) =>
					product.vmp_id === '3' && product.active === 1,
			);
		});
	});

	describe('updateAvailableStores', () => {
		it('should insert any new stores', async () => {
			const mockStore1 = createMockStore({ store_id: '1', name: 'Store 1' });
			const mockStore2 = createMockStore({ store_id: '2', name: 'Store 2' });
			const mockStore3 = createMockStore({ store_id: '3', name: 'Store 3' });
			jest
				.spyOn(vinmonopoletService, 'getAllStores')
				.mockResolvedValue([mockStore1, mockStore2, mockStore3]);

			await service.updateAvailableStores();

			const allStores = await service.getAllStores();
			expect(allStores).toHaveLength(3);
			expect(allStores).toIncludeAllMembers([
				mockStore1,
				mockStore2,
				mockStore3,
			]);
		});

		it('should delete any stores not included in the resposne from vinmonopolet', async () => {
			const mockStore1 = createMockStore({ store_id: '1', name: 'Store 1' });
			const mockStore2 = createMockStore({ store_id: '2', name: 'Store 2' });
			const mockStore3 = createMockStore({ store_id: '3', name: 'Store 3' });
			await storeRepository.save([mockStore1, mockStore2, mockStore3]);
			jest
				.spyOn(vinmonopoletService, 'getAllStores')
				.mockResolvedValue([mockStore1, mockStore3]);

			await service.updateAvailableStores();

			const allStores = await service.getAllStores();
			expect(allStores).toHaveLength(2);
			expect(allStores).not.toIncludeAllMembers([mockStore2]);
		});

		it('should update any existing stores', async () => {
			const existingStore = createMockStore({
				store_id: '1',
				name: 'Old name',
			});
			const updatedStore = createMockStore({ store_id: '1', name: 'New name' });
			await storeRepository.save(existingStore);
			jest
				.spyOn(vinmonopoletService, 'getAllStores')
				.mockResolvedValue([updatedStore]);

			await service.updateAvailableStores();

			const allStores = await service.getAllStores();
			expect(allStores).toHaveLength(1);
			expect(allStores[0].name).toBe('New name');
		});
	});
});
