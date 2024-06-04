import { DatabaseModule } from '@modules/database/database.module';
import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { ProductsRepository } from '@modules/products/repositories/products.repository';
import { StoresRepository } from '@modules/stores/repositories/stores.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { deepCopyClass } from '@utils/deepCopyClass';
import { postgresClient } from 'test/initIntegrationTestEnvironment';
import {
	mockProducts,
	mockUntappdProductWithScoreOf0,
	mockVinmonopoletProduct1,
	mockVinmonopoletProduct2,
	mockVinmonopoletProduct3,
	mockVinmonopoletProduct4,
	mockVinmonopoletProduct5,
	mockVinmonopoletProductWithoutAssociatedUntappdProduct,
} from 'test/mocks/mockProducts';
import { mockStore1, mockStores } from 'test/mocks/mockStores';
import {
	createMockUntappdProduct,
	createMockVinmonopoletProduct,
	createMockVinmonopoletProductWithStockLevel,
} from 'test/utils/createMockData';
import { productsShouldMatch } from 'test/utils/testUtils';

describe('productRepository', () => {
	let productRepository: ProductsRepository;
	let storeRepository: StoresRepository;
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

	const MOCK_STOCK_WITHOUT_UNTAPPD_PRODUCT =
		createMockVinmonopoletProductWithStockLevel({
			vmp_id: mockVinmonopoletProductWithoutAssociatedUntappdProduct.vmp_id,
			stockLevel: 20,
		});

	const MOCK_STOCK_ZERO_SCORE = createMockVinmonopoletProductWithStockLevel({
		vmp_id: mockUntappdProductWithScoreOf0.vmp_id,
		untappd: mockUntappdProductWithScoreOf0,
		stockLevel: 190,
	});

	const insertMockProducts = async () => {
		for (const mockProduct of mockProducts) {
			await productRepository.saveProduct(mockProduct);
		}
	};

	const insertMockStores = async () => {
		for (const mockStore of mockStores) {
			await storeRepository.saveStore(mockStore);
		}
	};

	beforeAll(async () => {
		testingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			providers: [ProductsRepository, StoresRepository],
		}).compile();

		productRepository =
			testingModule.get<ProductsRepository>(ProductsRepository);

		storeRepository = testingModule.get<StoresRepository>(StoresRepository);

		await insertMockStores();
	});

	afterAll(async () => {
		await testingModule.close();
	});

	afterEach(async () => {
		await postgresClient.query('DELETE FROM vinmonopolet_products');
	});

	describe('getProductById', () => {
		it('should return product with active as true if the product has a stock entry', async () => {
			await insertMockProducts();
			await storeRepository.updateStockForStore(
				[MOCK_STOCK1],
				mockStore1.store_id,
			);

			const retrievedProduct = await productRepository.getProductById(
				mockVinmonopoletProduct1.vmp_id,
			);

			expect(retrievedProduct).toMatchProduct(mockVinmonopoletProduct1);
		});

		it('should return active as false if the product has no stock entries', async () => {
			await insertMockProducts();

			const retrievedProduct = await productRepository.getProductById(
				mockVinmonopoletProduct1.vmp_id,
			);

			expect(retrievedProduct?.active).toBeFalse;
		});
	});

	describe('saveProduct', () => {
		it('should correctly save product to database', async () => {
			await productRepository.saveProduct(mockVinmonopoletProduct1);
			await storeRepository.updateStockForStore(
				[MOCK_STOCK1],
				mockStore1.store_id,
			);

			const retrievedProduct = await productRepository.getProductById(
				mockVinmonopoletProduct1.vmp_id,
			);

			expect(retrievedProduct).toMatchProduct(mockVinmonopoletProduct1);
		});

		it('should update existing product', async () => {
			await productRepository.saveProduct(mockVinmonopoletProduct2);
			await storeRepository.updateStockForStore(
				[MOCK_STOCK2],
				mockStore1.store_id,
			);

			const updatedProduct = deepCopyClass(mockVinmonopoletProduct2);

			updatedProduct.price = 499.9;
			updatedProduct.vmp_name = 'Oppdatert Navn';
			updatedProduct.buyable = false;

			await productRepository.saveProduct(updatedProduct);

			const retrievedProduct = await productRepository.getProductById(
				mockVinmonopoletProduct2.vmp_id,
			);
			expect(retrievedProduct).toMatchProduct(updatedProduct);
		});

		it('should create added_timestamp and last_updated timestamp', async () => {
			const productWithoutDates = mockVinmonopoletProduct1;
			productWithoutDates.added_date = undefined;
			productWithoutDates.last_updated = undefined;

			await productRepository.saveProduct(productWithoutDates);

			const retrievedProduct = await productRepository.getProductById(
				mockVinmonopoletProduct1.vmp_id,
			);

			expect(retrievedProduct).not.toBeNull();
			expect(retrievedProduct?.untappd).not.toBeUndefined();
			expect(retrievedProduct?.added_date).toBeWithinSecondsOfDate(
				new Date(),
				10,
			);
			expect(retrievedProduct?.last_updated).toBeWithinSecondsOfDate(
				new Date(),
				10,
			);
			expect(retrievedProduct?.untappd?.last_updated).toBeWithinSecondsOfDate(
				new Date(),
				10,
			);
		});

		it('should only update last_updated timestamp when updating an existing product', async () => {
			await productRepository.saveProduct(mockVinmonopoletProduct1);

			const retrievedProduct = await productRepository.getProductById(
				mockVinmonopoletProduct1.vmp_id,
			);
			const addedDateWhenInserted = retrievedProduct?.added_date;
			const lastUpdatedWhenInserted = retrievedProduct?.last_updated;

			await productRepository.saveProduct(mockVinmonopoletProduct1);

			const retrievedUpdatedProduct = await productRepository.getProductById(
				mockVinmonopoletProduct1.vmp_id,
			);
			const addedDateWhenUpdated = retrievedUpdatedProduct?.added_date;
			const lastUpdatedWhenUpdated = retrievedUpdatedProduct?.last_updated;

			expect(addedDateWhenInserted).toBeWithinSecondsOfDate(
				lastUpdatedWhenInserted,
				1,
			);
			expect(addedDateWhenInserted).toEqual(addedDateWhenUpdated);
			expect(lastUpdatedWhenUpdated).not.toEqual(addedDateWhenUpdated);
			expect(lastUpdatedWhenInserted).toBeAfter(addedDateWhenUpdated as Date);
		});
	});

	describe('getProducts', () => {
		it('can get all products regardless of active state', async () => {
			await insertMockProducts();
			await storeRepository.updateStockForStore(
				[MOCK_STOCK1, MOCK_STOCK2],
				mockStore1.store_id,
			);

			const retrievedProducts = await productRepository.getProducts(
				undefined,
				true,
			);

			productsShouldMatch(retrievedProducts, mockProducts);
		});

		it('can get all products regardless of active state and associated untappd products', async () => {
			await insertMockProducts();
			await productRepository.saveProduct(
				mockVinmonopoletProductWithoutAssociatedUntappdProduct,
			);

			const retrievedProducts = await productRepository.getProducts(
				undefined,
				undefined,
			);

			productsShouldMatch(retrievedProducts, [
				...mockProducts,
				mockVinmonopoletProductWithoutAssociatedUntappdProduct,
			]);
		});

		it('can get all active products with an associated untappd product', async () => {
			await insertMockProducts();
			await storeRepository.updateStockForStore(
				[MOCK_STOCK1, MOCK_STOCK2],
				mockStore1.store_id,
			);

			const retrievedProducts = await productRepository.getProducts(true, true);

			productsShouldMatch(retrievedProducts, [
				mockVinmonopoletProduct1,
				mockVinmonopoletProduct2,
			]);
		});

		it('can get all active products without an associated untappd product', async () => {
			await insertMockProducts();
			await productRepository.saveProduct(
				mockVinmonopoletProductWithoutAssociatedUntappdProduct,
			);
			await storeRepository.updateStockForStore(
				[MOCK_STOCK1, MOCK_STOCK2, MOCK_STOCK_WITHOUT_UNTAPPD_PRODUCT],
				mockStore1.store_id,
			);

			const retrievedProducts = await productRepository.getProducts(
				true,
				false,
			);

			productsShouldMatch(retrievedProducts, [
				mockVinmonopoletProductWithoutAssociatedUntappdProduct,
			]);
		});

		it('can get all inactive products', async () => {
			await insertMockProducts();
			await storeRepository.updateStockForStore(
				[MOCK_STOCK1, MOCK_STOCK2],
				mockStore1.store_id,
			);

			const retrievedProducts = await productRepository.getProducts(
				false,
				true,
			);

			productsShouldMatch(
				retrievedProducts,
				[
					mockVinmonopoletProduct3,
					mockVinmonopoletProduct4,
					mockVinmonopoletProduct5,
				],
				true,
			);
			retrievedProducts.forEach((product) => expect(product.active).toBeFalse);
		});

		it('can search for an active product by name', async () => {
			await insertMockProducts();
			await storeRepository.updateStockForStore(
				[MOCK_STOCK1],
				mockStore1.store_id,
			);

			const retrievedProducts = await productRepository.getProducts(
				true,
				undefined,
				'Imperial Stout',
			);
			expect(retrievedProducts).toHaveLength(1);
			expect(retrievedProducts[0]).toMatchProduct(mockVinmonopoletProduct1);
		});

		it('Can search for an inactive product', async () => {
			await insertMockProducts();
			await storeRepository.updateStockForStore(
				[MOCK_STOCK1, MOCK_STOCK2],
				mockStore1.store_id,
			);
			const retrievedProducts = await productRepository.getProducts(
				false,
				undefined,
				'Lambic',
			);

			expect(retrievedProducts).toHaveLength(1);
			expect(retrievedProducts[0]).toMatchProduct(
				mockVinmonopoletProduct4,
				true,
			);
			expect(retrievedProducts[0].active).toBeFalse;
		});

		it('Can search for product regardless of active state', async () => {
			await insertMockProducts();
			await storeRepository.updateStockForStore(
				[MOCK_STOCK2],
				mockStore1.store_id,
			);

			const retrievedProducts = await productRepository.getProducts(
				undefined,
				undefined,
				'Mock Brewery',
			);

			expect(retrievedProducts).toHaveLength(1);
			expect(retrievedProducts[0]).toMatchProduct(mockVinmonopoletProduct2);
		});

		it('Can search for products by category', async () => {
			await insertMockProducts();
			const expectedProducts = mockProducts.filter((x) => x.category === 'Øl');

			const retrievedProducts = await productRepository.getProducts(
				undefined,
				undefined,
				undefined,
				['Øl'],
			);

			expect(retrievedProducts).toHaveLength(expectedProducts.length);
			productsShouldMatch(retrievedProducts, expectedProducts, true);
		});

		it('Can search for products by multiple categories', async () => {
			await insertMockProducts();
			const expectedProducts = mockProducts.filter(
				(x) => x.category === 'Øl' || x.category === 'Mjød',
			);

			const retrievedProducts = await productRepository.getProducts(
				undefined,
				undefined,
				undefined,
				['Øl', 'Mjød'],
			);

			expect(retrievedProducts).toHaveLength(expectedProducts.length);
			productsShouldMatch(retrievedProducts, expectedProducts, true);
		});

		it('Can search for products by sub category', async () => {
			await insertMockProducts();
			const expectedProducts = mockProducts.filter(
				(x) => x.sub_category === 'Surøl',
			);

			const retrievedProducts = await productRepository.getProducts(
				undefined,
				undefined,
				undefined,
				undefined,
				['Surøl'],
			);

			expect(retrievedProducts).toHaveLength(expectedProducts.length);
			productsShouldMatch(retrievedProducts, expectedProducts, true);
		});

		it('Can search for products by multiple sub categories', async () => {
			await insertMockProducts();
			const expectedProducts = mockProducts.filter(
				(x) => x.sub_category === 'Surøl' || x.sub_category === 'Lys Lager',
			);

			const retrievedProducts = await productRepository.getProducts(
				undefined,
				undefined,
				undefined,
				undefined,
				['Surøl', 'Lys Lager'],
			);

			expect(retrievedProducts).toHaveLength(expectedProducts.length);
			productsShouldMatch(retrievedProducts, expectedProducts, true);
		});

		it('Can search for products with all possible queries at once', async () => {
			await insertMockProducts();
			await storeRepository.updateStockForStore(
				[MOCK_STOCK2],
				mockStore1.store_id,
			);
			const expectedProducts = [mockVinmonopoletProduct2];

			const retrievedProducts = await productRepository.getProducts(
				true,
				true,
				'Double',
				['Øl'],
				['India Pale Ale'],
			);

			expect(retrievedProducts).toHaveLength(expectedProducts.length);
			productsShouldMatch(retrievedProducts, expectedProducts, true);
		});

		it('Can search for products limit and offset', async () => {
			await insertMockProducts();

			const retrievedProducts1 = await productRepository.getProducts(
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				1,
				0,
			);

			const retrievedProducts2 = await productRepository.getProducts(
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				1,
				1,
			);

			expect(retrievedProducts1).toHaveLength(1);
			expect(retrievedProducts2).toHaveLength(1);
			expect(retrievedProducts1[0].vmp_id).not.toBe(
				retrievedProducts2[0].vmp_id,
			);
		});
	});

	describe('getProductsWithUntappdScoreOf0', () => {
		it('should get all products with untappd score of 0', async () => {
			const productWithScoreOf0 = createMockVinmonopoletProduct({
				vmp_id: mockUntappdProductWithScoreOf0.vmp_id,
				untappd: mockUntappdProductWithScoreOf0,
			});
			await insertMockProducts();
			await productRepository.saveProduct(productWithScoreOf0);
			await storeRepository.updateStockForStore(
				[MOCK_STOCK_ZERO_SCORE],
				mockStore1.store_id,
			);

			const retrievedProducts =
				await productRepository.getProductsWithScoreOfZero();

			productsShouldMatch(retrievedProducts, [productWithScoreOf0]);
		});
	});

	describe('getOldestUntappdProducts', () => {
		it('should get a list of untappd products ordered by last_updated ascending', async () => {
			await productRepository.saveProduct(mockVinmonopoletProduct2);
			await productRepository.saveProduct(mockVinmonopoletProduct1);
			await productRepository.saveProduct(mockVinmonopoletProduct3);
			await productRepository.saveProduct(mockVinmonopoletProduct1);

			await storeRepository.updateStockForStore(
				[MOCK_STOCK1, MOCK_STOCK2, MOCK_STOCK3],
				mockStore1.store_id,
			);

			const retrievedProducts =
				await productRepository.getOldestUntappdProducts();

			expect(retrievedProducts).toHaveLength(3);
			expect(retrievedProducts[0]).toMatchProduct(mockVinmonopoletProduct2);
			expect(retrievedProducts[1]).toMatchProduct(mockVinmonopoletProduct3);
			expect(retrievedProducts[2]).toMatchProduct(mockVinmonopoletProduct1);
		});

		it('should not get inactive products', async () => {
			await productRepository.saveProduct(mockVinmonopoletProduct2);
			await productRepository.saveProduct(mockVinmonopoletProduct1);
			await productRepository.saveProduct(mockVinmonopoletProduct3);
			await productRepository.saveProduct(mockVinmonopoletProduct1);

			await storeRepository.updateStockForStore(
				[MOCK_STOCK1, MOCK_STOCK3],
				mockStore1.store_id,
			);

			const retrievedProducts =
				await productRepository.getOldestUntappdProducts();

			expect(retrievedProducts).toHaveLength(2);
			expect(retrievedProducts[0]).toMatchProduct(mockVinmonopoletProduct3);
			expect(retrievedProducts[1]).toMatchProduct(mockVinmonopoletProduct1);
		});
	});

	describe('deleteUntappdProduct', () => {
		it('should delete untappd product', async () => {
			await productRepository.saveProduct(mockVinmonopoletProduct1);

			await productRepository.deleteUntappdProduct(
				mockVinmonopoletProduct1.vmp_id,
			);

			const retrievedProduct = await productRepository.getProductById(
				mockVinmonopoletProduct1.vmp_id,
			);
			expect(retrievedProduct?.untappd).toBeUndefined();
		});
	});

	describe('vinmonopoletProductHasUntappdProduct', () => {
		it('should return true if product has an associated untappd product', async () => {
			await productRepository.saveProduct(mockVinmonopoletProduct1);

			const hasUntappdProduct =
				await productRepository.vinmonopoletProductHasUntappdProduct(
					mockVinmonopoletProduct1.vmp_id,
				);

			expect(hasUntappdProduct).toBeTrue;
		});

		it('should return false if product does not have an associated untappd product', async () => {
			await productRepository.saveProduct(
				mockVinmonopoletProductWithoutAssociatedUntappdProduct,
			);

			const hasUntappdProduct =
				await productRepository.vinmonopoletProductHasUntappdProduct(
					mockVinmonopoletProductWithoutAssociatedUntappdProduct.vmp_id,
				);

			expect(hasUntappdProduct).toBeFalse;
		});
	});

	describe('saveUntappdProduct', () => {
		it('should save untappd product', async () => {
			await productRepository.saveProduct(
				mockVinmonopoletProductWithoutAssociatedUntappdProduct,
			);
			const untappdProductToSave = createMockUntappdProduct({
				vmp_id: mockVinmonopoletProductWithoutAssociatedUntappdProduct.vmp_id,
				untappd_id: 'recently_saved',
			});

			await productRepository.saveUntappdProduct(untappdProductToSave);

			const retrievedProduct = await productRepository.getProductById(
				mockVinmonopoletProductWithoutAssociatedUntappdProduct.vmp_id,
			);
			const expectedProduct = deepCopyClass(
				mockVinmonopoletProductWithoutAssociatedUntappdProduct,
			);
			expectedProduct.untappd = untappdProductToSave;
			expect(retrievedProduct).toMatchProduct(expectedProduct, true);
		});

		it('should update existing untappd product', async () => {
			await productRepository.saveProduct(mockVinmonopoletProduct1);
			const updatedUntappdProduct = deepCopyClass(
				mockVinmonopoletProduct1.untappd,
			) as UntappdProduct;
			updatedUntappdProduct.rating = 3.789;
			updatedUntappdProduct.num_ratings = 123456;
			updatedUntappdProduct.brewery = 'New And Cooler Brewery';
			updatedUntappdProduct.picture_url = 'https://new_image.com';
			updatedUntappdProduct.style = 'New And Cooler Style';
			updatedUntappdProduct.untappd_name = 'New And Cooler Untappd Product';
			updatedUntappdProduct.untappd_url = 'https://new-and-improved.com';

			await productRepository.saveUntappdProduct(updatedUntappdProduct);

			const retrievedProduct = await productRepository.getProductById(
				mockVinmonopoletProduct1.vmp_id,
			);
			const expectedProduct = deepCopyClass(mockVinmonopoletProduct1);
			expectedProduct.untappd = updatedUntappdProduct;
			expect(retrievedProduct).toMatchProduct(expectedProduct, true);
		});
	});
});
