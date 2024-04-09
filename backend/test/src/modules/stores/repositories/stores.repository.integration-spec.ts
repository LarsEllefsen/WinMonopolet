import { DatabaseModule } from '@modules/database/database.module';
import { ProductsRepository } from '@modules/products/repositories/products.repository';
import { Stock } from '@modules/stores/entities/stock.entity';
import { StoresRepository } from '@modules/stores/repositories/stores.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { postgresClient } from 'test/initIntegrationTestEnvironment';
import {
	mockProducts,
	mockVinmonopoletProduct1,
	mockVinmonopoletProduct2,
	mockVinmonopoletProduct3,
} from 'test/mocks/mockProducts';
import {
	mockStore1,
	mockStore2,
	mockStore3,
	mockStores,
} from 'test/mocks/mockStores';
import {
	createMockStore,
	createMockVinmonopoletProductWithStockLevel,
} from 'test/utils/createMockData';

describe('storesRepository', () => {
	let storeRepository: StoresRepository;
	let productRepository: ProductsRepository;
	let testingModule: TestingModule;

	const MOCK_STOCK1 = createMockVinmonopoletProductWithStockLevel({
		vmp_id: mockVinmonopoletProduct1.vmp_id,
		stockLevel: 10,
	});
	const MOCK_STOCK2 = createMockVinmonopoletProductWithStockLevel({
		vmp_id: mockVinmonopoletProduct2.vmp_id,
		stockLevel: 20,
	});
	const MOCK_STOCK3 = createMockVinmonopoletProductWithStockLevel({
		vmp_id: mockVinmonopoletProduct3.vmp_id,
		stockLevel: 30,
	});
	const MOCK_STOCK_PRODUCT_DOESNT_EXIST =
		createMockVinmonopoletProductWithStockLevel({
			vmp_id: '-1',
			stockLevel: 30,
		});

	const insertMockStores = async () => {
		for (const mockStore of mockStores) {
			await storeRepository.saveStore(mockStore);
		}
	};

	const insertMockProducts = async () => {
		for (const mockProduct of mockProducts) {
			await productRepository.saveProduct(mockProduct);
		}
	};

	beforeAll(async () => {
		testingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			providers: [StoresRepository, ProductsRepository],
		}).compile();

		storeRepository = testingModule.get<StoresRepository>(StoresRepository);
		productRepository =
			testingModule.get<ProductsRepository>(ProductsRepository);
	});

	afterAll(async () => {
		await testingModule.close();
	});

	afterEach(async () => {
		await postgresClient.query('DELETE FROM stores');
	});

	describe('saveStore', () => {
		it('should save a new store', async () => {
			const newStore = createMockStore({ store_id: '4' });

			await storeRepository.saveStore(newStore);
		});

		it('should update existing store', async () => {
			await insertMockStores();
			const modifiedStore = createMockStore({
				store_id: '1',
				name: 'Vinmonopolet Vinglevika',
				formatted_name: 'Vinmonopolet_vinglevika',
				address: 'vinglesvingen 67',
				city: 'Vinglevika',
				zip: '4201',
				lat: '1',
				lon: '2',
				category: 4,
			});

			await storeRepository.saveStore(modifiedStore);

			const retrievedStore = await storeRepository.getStore('1');
			expect(retrievedStore).toEqual(modifiedStore);
		});
	});

	describe('deleteStore', () => {
		it('should delete store', async () => {
			await insertMockStores();

			await storeRepository.deleteStore(mockStore2.store_id);

			const retrievedStores = await storeRepository.getAllStores();
			expect(retrievedStores).toHaveLength(mockStores.length - 1);
			expect(retrievedStores).not.toContain(mockStore2);
		});
	});

	describe('getStore', () => {
		it('should get store', async () => {
			await insertMockStores();

			const retrievedStore = await storeRepository.getStore(
				mockStore3.store_id,
			);

			expect(retrievedStore).toEqual(mockStore3);
		});

		it('should return null if store was not found', async () => {
			await insertMockStores();

			const retrievedStore = await storeRepository.getStore('-1');

			expect(retrievedStore).toBeNull();
		});
	});

	describe('getAllStores', () => {
		it('should get all stores in the database', async () => {
			await insertMockStores();

			const stores = await storeRepository.getAllStores();

			expect(stores).toHaveLength(mockStores.length);
			expect(stores.find((x) => x.store_id === mockStores[0].store_id)).toEqual(
				mockStores[0],
			);
		});
	});

	describe('getStockForStore', () => {
		it('should return all stock for the given store', async () => {
			const expectedStock = [
				new Stock(
					mockStore1.store_id,
					MOCK_STOCK1.vinmonopoletProduct,
					MOCK_STOCK1.stockLevel,
				),
				new Stock(
					mockStore1.store_id,
					MOCK_STOCK3.vinmonopoletProduct,
					MOCK_STOCK3.stockLevel,
				),
			];
			await insertMockStores();
			await insertMockProducts();
			await storeRepository.updateStockForStore(
				[MOCK_STOCK1, MOCK_STOCK3],
				mockStore1.store_id,
			);
			await storeRepository.updateStockForStore(
				[MOCK_STOCK1, MOCK_STOCK2],
				mockStore2.store_id,
			);

			const retrievedStock = await storeRepository.getStockForStore('1');

			expect(retrievedStock).toHaveLength(2);
			expect(retrievedStock).toMatchStock(expectedStock);
		});
	});

	describe('updateStockForStore', () => {
		it('Should insert any new stock and remove any old stock', async () => {
			const expectedStock = [
				new Stock(
					mockStore1.store_id,
					MOCK_STOCK2.vinmonopoletProduct,
					MOCK_STOCK2.stockLevel,
				),
				new Stock(
					mockStore1.store_id,
					MOCK_STOCK3.vinmonopoletProduct,
					MOCK_STOCK3.stockLevel,
				),
			];
			await insertMockStores();
			await insertMockProducts();

			await storeRepository.updateStockForStore(
				[MOCK_STOCK1, MOCK_STOCK2],
				mockStore1.store_id,
			);

			await storeRepository.updateStockForStore(
				[MOCK_STOCK2, MOCK_STOCK3],
				mockStore1.store_id,
			);

			const retrievedStock = await storeRepository.getStockForStore(
				mockStore1.store_id,
			);
			expect(retrievedStock).toMatchStock(expectedStock);
		});

		it('should rollback all changes in case of an error', async () => {
			await insertMockStores();
			await insertMockProducts();

			await storeRepository.updateStockForStore(
				[MOCK_STOCK1, MOCK_STOCK2],
				mockStore1.store_id,
			);

			const retrievedProductsPreRollback =
				await storeRepository.getStockForStore('1');

			//Trigger crash by inserting stock for a product that doesnt exist
			await expect(
				storeRepository.updateStockForStore(
					[MOCK_STOCK3, MOCK_STOCK_PRODUCT_DOESNT_EXIST],
					mockStore1.store_id,
				),
			).rejects.toThrow();
			const retrievedProductsPostRollback =
				await storeRepository.getStockForStore('1');

			expect(retrievedProductsPostRollback).toEqual(
				retrievedProductsPreRollback,
			);
		});
	});
});
