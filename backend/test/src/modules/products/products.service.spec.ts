import { TestBed } from '@automock/jest';
import { productCategories } from '@common/constants';
import { APILimitReachedException } from '@exceptions/APILimitReachedException';
import { ProductsService } from '@modules/products/products.service';
import { ProductsRepository } from '@modules/products/repositories/products.repository';
import { UpcomingProductRepository } from '@modules/products/repositories/upcomingProduct.repository';
import { UntappdService } from '@modules/untappd/untappd.service';
import { VinmonopoletService } from '@modules/vinmonopolet/vinmonopolet.service';
import {
	mockUntappdProduct1,
	mockUpcomingVinmonopoletProduct1,
	mockUpcomingVinmonopoletProduct2,
	mockVinmonopoletProduct1,
	mockVinmonopoletProduct2,
	mockVinmonopoletProduct3,
	mockVinmonopoletProductWithoutAssociatedUntappdProduct,
} from 'test/mocks/mockProducts';
import { mockStore1 } from 'test/mocks/mockStores';
import {
	createMockUntappdProduct,
	createMockVinmonopoletProductWithStockLevel,
} from 'test/utils/createMockData';
import { Facet } from 'vinmonopolet-ts';

describe('productsService', () => {
	let productsService: ProductsService;
	let productRepository: ProductsRepository;
	let untappdService: UntappdService;
	let vinmonopoletService: VinmonopoletService;
	let upcomingProductRepository: UpcomingProductRepository;

	const mockVinmonopoletProductWithStockLevel1 =
		createMockVinmonopoletProductWithStockLevel({
			vmp_id: '1',
			stockLevel: 10,
		});

	const mockVinmonopoletProductWithStockLevel2 =
		createMockVinmonopoletProductWithStockLevel({
			vmp_id: '1',
			stockLevel: 20,
		});

	beforeAll(() => {
		const { unit, unitRef } = TestBed.create(ProductsService).compile();

		productsService = unit;
		productRepository = unitRef.get(ProductsRepository);
		untappdService = unitRef.get(UntappdService);
		vinmonopoletService = unitRef.get(VinmonopoletService);
		upcomingProductRepository = unitRef.get(UpcomingProductRepository);
	});

	describe('updateUntappdProductsWithScoreOfZero', () => {
		it('should update all the products retrieved from the database', async () => {
			jest
				.spyOn(productRepository, 'getProductsWithScoreOfZero')
				.mockResolvedValue([
					mockVinmonopoletProduct1,
					mockVinmonopoletProduct2,
				]);
			const getUntappdProductSpy = jest.spyOn(
				untappdService,
				'getUntappdProduct',
			);
			const saveUntappdProductSpy = jest.spyOn(
				productRepository,
				'saveUntappdProduct',
			);

			await productsService.updateUntappdProductsWithScoreOfZero();

			expect(getUntappdProductSpy).toHaveBeenCalledTimes(2);
			expect(saveUntappdProductSpy).toHaveBeenCalledTimes(2);
		});

		it('should throw if any of the products do not have an associated untappd product', async () => {
			jest
				.spyOn(productRepository, 'getProductsWithScoreOfZero')
				.mockResolvedValue([
					mockVinmonopoletProductWithoutAssociatedUntappdProduct,
				]);

			await expect(
				productsService.updateUntappdProductsWithScoreOfZero(),
			).rejects.toThrow(
				`Vinmonopolet product ${mockVinmonopoletProductWithoutAssociatedUntappdProduct.vmp_name} does not have an associated untappd product`,
			);
		});
	});

	describe('updateOldestUntappdProducts', () => {
		it('should update all the products retrieved from the database', async () => {
			jest
				.spyOn(productRepository, 'getOldestUntappdProducts')
				.mockResolvedValue([
					mockVinmonopoletProduct1,
					mockVinmonopoletProduct2,
				]);
			const getUntappdProductSpy = jest.spyOn(
				untappdService,
				'getUntappdProduct',
			);
			const saveUntappdProductSpy = jest.spyOn(
				productRepository,
				'saveUntappdProduct',
			);

			await productsService.updateOldestUntappdProducts();

			expect(getUntappdProductSpy).toHaveBeenCalledTimes(2);
			expect(saveUntappdProductSpy).toHaveBeenCalledTimes(2);
		});

		it('should throw if any of the products do not have an associated untappd product', async () => {
			jest
				.spyOn(productRepository, 'getOldestUntappdProducts')
				.mockResolvedValue([
					mockVinmonopoletProductWithoutAssociatedUntappdProduct,
				]);

			await expect(
				productsService.updateOldestUntappdProducts(),
			).rejects.toThrow(
				`Vinmonopolet product ${mockVinmonopoletProductWithoutAssociatedUntappdProduct.vmp_name} does not have an associated untappd product`,
			);
		});
	});

	describe('createUntappdProductForVinmonopoletProduct', () => {
		it('should create and save a new untappd product', async () => {
			const mockUntappdProduct = createMockUntappdProduct({
				vmp_id: mockVinmonopoletProductWithoutAssociatedUntappdProduct.vmp_id,
				untappd_id: '1',
			});
			jest
				.spyOn(productRepository, 'getProductById')
				.mockResolvedValue(
					mockVinmonopoletProductWithoutAssociatedUntappdProduct,
				);
			const getUntappdProductSpy = jest
				.spyOn(untappdService, 'getUntappdProduct')
				.mockResolvedValue(mockUntappdProduct);

			await productsService.createUntappdProductForVinmonopoletProduct(
				mockVinmonopoletProductWithoutAssociatedUntappdProduct.vmp_id,
				'1',
			);

			expect(getUntappdProductSpy).toHaveBeenCalledWith(
				'1',
				mockVinmonopoletProductWithoutAssociatedUntappdProduct.vmp_id,
			);
		});

		it('should throw if vinmonopolet product does not exist', async () => {
			jest.spyOn(productRepository, 'getProductById').mockResolvedValue(null);

			await expect(
				productsService.createUntappdProductForVinmonopoletProduct(
					mockVinmonopoletProductWithoutAssociatedUntappdProduct.vmp_id,
					'1',
				),
			).rejects.toThrow(
				`No vinmonopol product with id ${mockVinmonopoletProductWithoutAssociatedUntappdProduct.vmp_id} found.`,
			);
		});
	});

	describe('deleteUntappdProduct', () => {
		it('should delete untappd product for the given vinmonopolet product', async () => {
			jest
				.spyOn(productRepository, 'getProductById')
				.mockResolvedValue(mockVinmonopoletProduct1);
			const deleteUntappdProductSpy = jest.spyOn(
				productRepository,
				'deleteUntappdProduct',
			);

			await productsService.deleteUntappdProduct(
				mockVinmonopoletProduct1.vmp_id,
			);

			expect(deleteUntappdProductSpy).toHaveBeenCalledWith(
				mockVinmonopoletProduct1.untappd?.untappd_id,
			);
		});

		it('should throw if vinmonopolet product does not have an associated untappd product', async () => {
			jest
				.spyOn(productRepository, 'getProductById')
				.mockResolvedValue(
					mockVinmonopoletProductWithoutAssociatedUntappdProduct,
				);

			await expect(
				productsService.deleteUntappdProduct(mockVinmonopoletProduct1.vmp_id),
			).rejects.toThrow(
				`No untappd product associated with vinmonpol product ${mockVinmonopoletProduct1.vmp_id}`,
			);
		});
	});

	describe('getProductsByStore', () => {
		it('should process and return all products for store', async () => {
			const mockProductsWithStockLevelToReturn = [
				mockVinmonopoletProductWithStockLevel1,
				mockVinmonopoletProductWithStockLevel2,
			];
			const getAllProductsByStoreSpy = jest
				.spyOn(vinmonopoletService, 'getAllProductsByStore')
				.mockResolvedValue(mockProductsWithStockLevelToReturn);
			jest
				.spyOn(productRepository, 'vinmonopoletProductHasUntappdProduct')
				.mockResolvedValue(true);

			const productsByStore = await productsService.getProductsByStore(
				mockStore1,
			);

			expect(productsByStore).toHaveLength(
				mockProductsWithStockLevelToReturn.length * productCategories.length,
			);
			expect(getAllProductsByStoreSpy).toHaveBeenCalledTimes(
				productCategories.length,
			);
		});
	});

	describe('findAndSaveAnyUpcomingProducts', () => {
		it('should save all upcoming products', async () => {
			const mockProductsToReturn = [
				mockUpcomingVinmonopoletProduct1,
				mockUpcomingVinmonopoletProduct2,
			];
			const getAllProductsSpy = jest
				.spyOn(vinmonopoletService, 'getAllProducts')
				.mockResolvedValue(mockProductsToReturn);
			const upcomingProductRepositorySpy = jest.spyOn(
				upcomingProductRepository,
				'saveUpcomingProduct',
			);

			await productsService.findAndSaveAnyUpcomingProducts();

			expect(getAllProductsSpy).toHaveBeenCalledTimes(productCategories.length);
			expect(getAllProductsSpy).toHaveBeenLastCalledWith([
				productCategories[productCategories.length - 1],
				Facet.UpcomingProduct,
			]);
			expect(upcomingProductRepositorySpy).toHaveBeenCalledTimes(
				mockProductsToReturn.length * productCategories.length,
			);
		});
	});

	describe('insertOrUpdateAllVinmonopoletProducts', () => {
		it('should get all products, process them and then save them to the database', async () => {
			const mockProductsToReturn = [
				mockVinmonopoletProduct1,
				mockVinmonopoletProduct2,
				mockVinmonopoletProduct3,
			];
			const getAllProductsSpy = jest
				.spyOn(vinmonopoletService, 'getAllProducts')
				.mockResolvedValue(mockProductsToReturn);
			const saveProductSpy = jest.spyOn(productRepository, 'saveProduct');
			const tryToFindMatchingUntappdProductSpy = jest
				.spyOn(untappdService, 'tryToFindMatchingUntappdProduct')
				.mockImplementation((vinmonopoletProduct) => {
					if (vinmonopoletProduct.vmp_id === mockProductsToReturn[0].vmp_id)
						return Promise.resolve(mockUntappdProduct1);
					return Promise.resolve(undefined);
				});
			const saveUntappdProductSpy = jest.spyOn(
				productRepository,
				'saveUntappdProduct',
			);
			jest
				.spyOn(productRepository, 'vinmonopoletProductHasUntappdProduct')
				.mockImplementation((id) => {
					if (id === mockProductsToReturn[1].vmp_id)
						return Promise.resolve(true);
					return Promise.resolve(false);
				});

			await productsService.saveAllVinmonopoletProducts();

			expect(getAllProductsSpy).toHaveBeenCalledTimes(productCategories.length);
			expect(saveProductSpy).toHaveBeenCalledTimes(
				mockProductsToReturn.length * productCategories.length,
			);
			expect(tryToFindMatchingUntappdProductSpy).toHaveBeenCalledTimes(
				(mockProductsToReturn.length - 1) * mockProductsToReturn.length,
			);
			expect(saveUntappdProductSpy).toHaveBeenCalledWith(mockUntappdProduct1);
		});

		it('If processing a product fails, that product should be skipped and execution should continue', async () => {
			const mockProductsToReturn = [
				mockVinmonopoletProduct1,
				mockVinmonopoletProduct2,
				mockVinmonopoletProduct3,
			];
			jest
				.spyOn(vinmonopoletService, 'getAllProducts')
				.mockResolvedValue(mockProductsToReturn);
			jest
				.spyOn(untappdService, 'tryToFindMatchingUntappdProduct')
				.mockImplementation((vinmonopoletProduct) => {
					if (vinmonopoletProduct.vmp_id === mockProductsToReturn[1].vmp_id)
						throw new Error('500 Internal Server Error');
					return Promise.resolve(mockUntappdProduct1);
				});
			jest
				.spyOn(productRepository, 'vinmonopoletProductHasUntappdProduct')
				.mockResolvedValue(false);
			const saveProductSpy = jest.spyOn(productRepository, 'saveProduct');
			const saveUntappdProductSpy = jest.spyOn(
				productRepository,
				'saveUntappdProduct',
			);

			await productsService.saveAllVinmonopoletProducts();

			expect(saveProductSpy).toHaveBeenCalledTimes(
				mockProductsToReturn.length * productCategories.length,
			);
			expect(saveUntappdProductSpy).toHaveBeenCalledTimes(
				(mockProductsToReturn.length - 1) * productCategories.length,
			);
		});

		it('When api limit is reached, further calls to untappdService should be stopped', async () => {
			const mockProductsToReturn = [
				mockVinmonopoletProduct1,
				mockVinmonopoletProduct2,
				mockVinmonopoletProduct3,
			];
			jest
				.spyOn(vinmonopoletService, 'getAllProducts')
				.mockResolvedValue(mockProductsToReturn);
			jest
				.spyOn(productRepository, 'vinmonopoletProductHasUntappdProduct')
				.mockResolvedValue(false);
			const tryToFindMatchingUntappdProductSpy = jest
				.spyOn(untappdService, 'tryToFindMatchingUntappdProduct')
				.mockImplementation((vinmonopoletProduct) => {
					if (vinmonopoletProduct.vmp_id === mockProductsToReturn[1].vmp_id) {
						throw new APILimitReachedException();
					}
					return Promise.resolve(mockUntappdProduct1);
				});
			const saveProductSpy = jest.spyOn(productRepository, 'saveProduct');

			await productsService.saveAllVinmonopoletProducts();

			expect(tryToFindMatchingUntappdProductSpy).toHaveBeenCalledTimes(2);
			expect(saveProductSpy).toHaveBeenCalledTimes(
				mockProductsToReturn.length * productCategories.length,
			);
		});
	});
});
