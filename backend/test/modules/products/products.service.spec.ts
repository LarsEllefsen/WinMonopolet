import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { ProductsService } from '@modules/products/products.service';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { UntappdService } from '@modules/untappd/untappd.service';
import { VinmonopoletService } from '@modules/vinmonopolet/vinmonopolet.service';
import {
	createMockUntappdProduct,
	createMockVinmonopoletProduct,
} from 'test/utils/mockData';
import setupTestDatabase from 'test/utils/setupTestDatabase';
import { Repository } from 'typeorm';
import { APILimitReachedException } from '@exceptions/APILimitReachedException';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { WordlistModule } from '@modules/wordlist/wordlist.module';
import { productCategories } from '@common/constants';
import { VinmonopoletModule } from '@modules/vinmonopolet/vinmonopolet.module';

const moduleMocker = new ModuleMocker(global);

describe('productsService', () => {
	let productsService: ProductsService;
	let vinmonoPoletService: VinmonopoletService;
	let untappdService: UntappdService;
	let productRepository: Repository<VinmonopoletProduct>;
	let untappdRepository: Repository<UntappdProduct>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			imports: [
				setupTestDatabase,
				TypeOrmModule.forFeature([VinmonopoletProduct]),
				TypeOrmModule.forFeature([UntappdProduct]),
				WordlistModule,
				VinmonopoletModule,
			],
			providers: [ProductsService],
		})
			.useMocker((token) => {
				const mockMetadata = moduleMocker.getMetadata(
					token,
				) as MockFunctionMetadata<any, any>;
				const Mock = moduleMocker.generateFromMetadata(mockMetadata);
				return new Mock();
			})
			.compile();

		productsService = module.get<ProductsService>(ProductsService);
		vinmonoPoletService = module.get<VinmonopoletService>(VinmonopoletService);
		productRepository = module.get<Repository<VinmonopoletProduct>>(
			getRepositoryToken(VinmonopoletProduct),
		);
		untappdService = module.get<UntappdService>(UntappdService);
		untappdRepository = module.get<Repository<UntappdProduct>>(
			getRepositoryToken(UntappdProduct),
		);
	});

	afterEach(async () => {
		await untappdRepository.clear();
		await productRepository.clear();
		jest.resetAllMocks();
	});

	describe('insertOrUpdateAllVinmonopoletProducts', () => {
		it('if some operation for updating a product throws, product should be skipped and execution should continue', async () => {
			const mockVinmonopoletProducts = [
				createMockVinmonopoletProduct({
					vmp_id: '1',
					vmp_name: 'Crazy Cider',
					untappd: undefined,
				}),
				createMockVinmonopoletProduct({
					vmp_id: '2',
					vmp_name: 'Beautiful Beer',
					untappd: undefined,
				}),
				createMockVinmonopoletProduct({
					vmp_id: '3',
					vmp_name: 'Mad Mead',
					untappd: undefined,
				}),
			];
			jest
				.spyOn(vinmonoPoletService, 'getAllProducts')
				.mockResolvedValue(mockVinmonopoletProducts);
			const saveProductSpy = jest
				.spyOn(productRepository, 'save')
				.mockImplementation((entity: VinmonopoletProduct) => {
					if (entity.vmp_id === '2')
						throw new Error(
							'Something went incredibly wrong! Database blew up and is actively on fire as we speak',
						);
					return Promise.resolve(entity);
				});
			const findMatchingUntappdProductSpy = jest
				.spyOn(untappdService, 'tryToFindMatchingUntappdProduct')
				.mockResolvedValue(undefined);

			await productsService.insertOrUpdateAllVinmonopoletProducts();

			expect(saveProductSpy).toHaveBeenCalledTimes(
				productCategories.length * 3,
			);
			expect(findMatchingUntappdProductSpy).toHaveBeenCalledTimes(
				productCategories.length * 2,
			);
		});

		it('should catch APILimitReachedException thrown by UntappdService and stop all calls to untappd api for the remainder of the function call', async () => {
			const mockVinmonopoletProducts = [
				createMockVinmonopoletProduct({
					vmp_id: '1',
					vmp_name: 'Crazy Cider',
				}),
				createMockVinmonopoletProduct({
					vmp_id: '2',
					vmp_name: 'Beautiful Beer',
				}),
				createMockVinmonopoletProduct({
					vmp_id: '3',
					vmp_name: 'Mad Mead',
				}),
				createMockVinmonopoletProduct({
					vmp_id: '4',
					vmp_name: 'Imperial Test Beer',
				}),
			];
			jest
				.spyOn(vinmonoPoletService, 'getAllProducts')
				.mockResolvedValue(mockVinmonopoletProducts);
			jest.spyOn(untappdRepository, 'exist').mockResolvedValue(false);
			const findMatchingUntappdProductSpy = jest
				.spyOn(untappdService, 'tryToFindMatchingUntappdProduct')
				.mockImplementation((vinmonopoletProduct) => {
					if (vinmonopoletProduct.vmp_id === '2')
						throw new APILimitReachedException();
					else return Promise.resolve(undefined);
				});

			await productsService.insertOrUpdateAllVinmonopoletProducts();

			expect(findMatchingUntappdProductSpy).toHaveBeenCalledTimes(2);
		});

		it('if findMatchingUntappdProduct throws the vinmonopolet product should still be saved to the database', async () => {
			const mockVinmonopoletProducts = [
				createMockVinmonopoletProduct({
					vmp_id: '1',
					vmp_name: 'Crazy Cider',
				}),
			];
			jest
				.spyOn(vinmonoPoletService, 'getAllProducts')
				.mockResolvedValue(mockVinmonopoletProducts);
			jest
				.spyOn(untappdService, 'tryToFindMatchingUntappdProduct')
				.mockImplementation(() => {
					throw new APILimitReachedException();
				});

			await productsService.insertOrUpdateAllVinmonopoletProducts();
			const savedProduct = await productRepository.find();

			expect(savedProduct).toHaveLength(1);
			expect(savedProduct[0].vmp_id).toBe('1');
		});

		it('should try to find matching untappd product if product does not have an associated product, then save it to the database', async () => {
			const mockVinmonopoletProduct = createMockVinmonopoletProduct({
				vmp_id: '1',
				vmp_name: 'Mad Mead',
			});
			mockVinmonopoletProduct.untappd = undefined;

			const mockUntappdProduct = createMockUntappdProduct({
				vmp_id: '1',
				untappd_name: 'Mad Untappd Mead',
				untappd_id: '2',
			});
			await productRepository.save(mockVinmonopoletProduct);
			jest
				.spyOn(vinmonoPoletService, 'getAllProducts')
				.mockResolvedValue([mockVinmonopoletProduct]);
			const findMatchingUntappdProductSpy = jest
				.spyOn(untappdService, 'tryToFindMatchingUntappdProduct')
				.mockImplementation(() => {
					return Promise.resolve(mockUntappdProduct);
				});

			await productsService.insertOrUpdateAllVinmonopoletProducts();
			const savedProducts = await productRepository.find();

			expect(findMatchingUntappdProductSpy).toBeCalledTimes(1);
			expect(savedProducts).toHaveLength(1);
			expect(savedProducts[0].untappd?.untappd_id).toBe('2');
		});

		it('should not try to find matching untappd product if product already has an associated untappd product', async () => {
			const mockUntappdProduct = createMockUntappdProduct({
				vmp_id: '1',
				untappd_name: 'Mad Untappd Mead',
				untappd_id: '2',
			});
			const mockProducts = [
				createMockVinmonopoletProduct({
					vmp_id: '1',
					vmp_name: 'Mad Mead',
					untappd: mockUntappdProduct,
				}),
			];
			await productRepository.save(mockProducts);
			jest
				.spyOn(vinmonoPoletService, 'getAllProducts')
				.mockResolvedValue(mockProducts);
			const findMatchingUntappdProductSpy = jest
				.spyOn(untappdService, 'tryToFindMatchingUntappdProduct')
				.mockImplementation(() => {
					throw new Error('Should not be called');
				});

			await productsService.insertOrUpdateAllVinmonopoletProducts();

			expect(findMatchingUntappdProductSpy).toBeCalledTimes(0);
		});
	});

	describe('updateUntappdProductsWithScoreOfZero', () => {
		it('should update all products with a score of 0.0', async () => {
			const mockVinmonopoletProduct1 = createMockVinmonopoletProduct({
				vmp_id: '1',
				untappd: createMockUntappdProduct({
					vmp_id: '1',
					untappd_id: '1',
					rating: 0.0,
				}),
			});
			const mockVinmonopoletProduct2 = createMockVinmonopoletProduct({
				vmp_id: '2',
				untappd: createMockUntappdProduct({
					vmp_id: '2',
					untappd_id: '2',
					rating: 0.1,
				}),
			});
			const mockVinmonopoletProduct3 = createMockVinmonopoletProduct({
				vmp_id: '3',
				untappd: createMockUntappdProduct({
					vmp_id: '3',
					untappd_id: '3',
					rating: 0.0,
				}),
			});
			const mockVinmonopoletProductWithoutUntappdProduct =
				createMockVinmonopoletProduct({
					vmp_id: '4',
				});
			const mockUntappdProduct1 = createMockUntappdProduct({
				vmp_id: '1',
				untappd_id: '1',
				rating: 3.9,
			});
			const mockUntappdProduct3 = createMockUntappdProduct({
				vmp_id: '3',
				untappd_id: '3',
				rating: 4.3,
			});
			mockVinmonopoletProductWithoutUntappdProduct.untappd = undefined;
			await productRepository.save([
				mockVinmonopoletProduct1,
				mockVinmonopoletProduct2,
				mockVinmonopoletProduct3,
				mockVinmonopoletProductWithoutUntappdProduct,
			]);
			const updateUntappdProductsSpy = jest
				.spyOn(untappdService, 'getUntappdProduct')
				.mockImplementation((id) => {
					if (id === '1') return Promise.resolve(mockUntappdProduct1);
					if (id === '3') return Promise.resolve(mockUntappdProduct3);
					else throw new Error('Unexpected product id recieved');
				});

			await productsService.updateUntappdProductsWithScoreOfZero();

			const products = await productRepository.find();
			expect(updateUntappdProductsSpy).toHaveBeenCalledTimes(2);
			expect(products).toHaveLength(4);
			expect(products).toSatisfyAll((product: VinmonopoletProduct) => {
				if (product.vmp_id === '1') return product.untappd?.rating === 3.9;
				if (product.vmp_id === '2') return product.untappd?.rating === 0.1;
				if (product.vmp_id === '3') return product.untappd?.rating === 4.3;
				if (product.vmp_id === '4') return product.untappd === null;
				return false;
			});
		});
	});

	describe('updateOldestUntappdProducts', () => {
		it('should get active products by oldest untappd product LAST_UPDATED date and call updateUntappdProduct', async () => {
			const mockVinmonopoletProduct1 = createMockVinmonopoletProduct({
				vmp_id: '1',
				untappd: createMockUntappdProduct({
					untappd_id: '1',
					last_updated: new Date('2023-07-10T18:25:00'),
					rating: 2.5,
				}),
			});
			const mockUntappdProduct1 = createMockUntappdProduct({
				vmp_id: '1',
				rating: 3.9,
			});
			const mockVinmonopoletProduct2 = createMockVinmonopoletProduct({
				vmp_id: '2',
				untappd: createMockUntappdProduct({
					untappd_id: '2',
					last_updated: new Date('2021-10-23T14:54:00'),
				}),
			});
			const mockUntappdProduct2 = createMockUntappdProduct({
				vmp_id: '2',
				rating: 5.0,
			});
			const mockVinmonopoletProduct3 = createMockVinmonopoletProduct({
				vmp_id: '3',
				untappd: createMockUntappdProduct({
					untappd_id: '3',
					last_updated: new Date('2022-04-10T18:20:00'),
				}),
			});
			const mockUntappdProduct3 = createMockUntappdProduct({
				vmp_id: '3',
				rating: 3.3,
			});
			const mockVinmonopoletProduct4 = createMockVinmonopoletProduct({
				vmp_id: '4',
				active: 0,
				untappd: createMockUntappdProduct({
					untappd_id: '4',
					last_updated: new Date('2023-07-10T18:20:00'),
				}),
			});
			const mockUntappdProduct4 = createMockUntappdProduct({
				vmp_id: '4',
				rating: 4.01,
			});
			const mockVinmonopoletProductWithoutUntappdProduct =
				createMockVinmonopoletProduct({
					vmp_id: '5',
				});
			mockVinmonopoletProductWithoutUntappdProduct.untappd = undefined;
			const getUntappdProductSpy = jest
				.spyOn(untappdService, 'getUntappdProduct')
				.mockImplementation((id) => {
					if (id === '1') return Promise.resolve(mockUntappdProduct1);
					if (id === '2') return Promise.resolve(mockUntappdProduct2);
					if (id === '3') return Promise.resolve(mockUntappdProduct3);
					if (id === '4') return Promise.resolve(mockUntappdProduct4);
					throw new Error('unexpected id recieved');
				});
			await productRepository.save(
				[
					mockVinmonopoletProduct1,
					mockVinmonopoletProduct2,
					mockVinmonopoletProduct3,
					mockVinmonopoletProduct4,
					mockVinmonopoletProductWithoutUntappdProduct,
				],
				{ listeners: false },
			);

			await productsService.updateOldestUntappdProducts();

			expect(getUntappdProductSpy).toHaveBeenCalledTimes(3);
			expect(getUntappdProductSpy).lastCalledWith('1', '1');
		});

		it('If an error is thrown previously updated products should still be persisted to the database', async () => {
			const mockProduct1 = createMockVinmonopoletProduct({
				vmp_id: '1',
				untappd: createMockUntappdProduct({
					untappd_id: '1',
					last_updated: new Date('2023-07-10T18:25:00'),
					num_ratings: 999,
				}),
			});
			const mockProduct2 = createMockVinmonopoletProduct({
				vmp_id: '2',
				untappd: createMockUntappdProduct({
					untappd_id: '2',
					last_updated: new Date('2022-10-23T14:54:00'),
					num_ratings: 1,
				}),
			});
			const mockProduct3 = createMockVinmonopoletProduct({
				vmp_id: '3',
				untappd: createMockUntappdProduct({
					untappd_id: '3',
					last_updated: new Date('2023-07-10T18:20:00'),
					num_ratings: 56,
				}),
			});
			jest
				.spyOn(untappdService, 'getUntappdProduct')
				.mockImplementation((untappdId, vmpId) => {
					if (vmpId === '1') throw new Error('Server melted');
					const mockProductToReturn = createMockUntappdProduct({
						vmp_id: vmpId,
						untappd_id: untappdId,
						num_ratings: 897,
					});
					return Promise.resolve(mockProductToReturn);
				});
			await productRepository.save([mockProduct1, mockProduct2, mockProduct3], {
				listeners: false,
			});

			await expect(
				productsService.updateOldestUntappdProducts(),
			).rejects.toThrow('Server melted');

			const products = await productRepository.find();
			expect(products).toHaveLength(3);
			expect(products).toSatisfyAny(
				(product: VinmonopoletProduct) =>
					product.vmp_id === '2' && product.untappd?.num_ratings === 897,
			);
			expect(products).toSatisfyAny(
				(product: VinmonopoletProduct) =>
					product.vmp_id === '3' && product.untappd?.num_ratings === 897,
			);
			expect(products).toSatisfyAny(
				(product: VinmonopoletProduct) =>
					product.vmp_id === '1' && product.untappd?.num_ratings === 999,
			);
		});

		it('should gracefully exit when api limit is reached', async () => {
			const mockProduct1 = createMockVinmonopoletProduct({
				vmp_id: '1',
				untappd: createMockUntappdProduct({
					untappd_id: '1',
					last_updated: new Date('2023-07-10T18:25:00'),
					num_ratings: 999,
				}),
			});
			const mockProduct2 = createMockVinmonopoletProduct({
				vmp_id: '2',
				untappd: createMockUntappdProduct({
					untappd_id: '2',
					last_updated: new Date('2022-10-23T14:54:00'),
					num_ratings: 1,
				}),
			});
			const mockProduct3 = createMockVinmonopoletProduct({
				vmp_id: '3',
				untappd: createMockUntappdProduct({
					untappd_id: '3',
					last_updated: new Date('2023-07-10T18:20:00'),
					num_ratings: 56,
				}),
			});
			jest
				.spyOn(untappdService, 'getUntappdProduct')
				.mockImplementation((untappdId, vmpId) => {
					if (vmpId === '1') throw new APILimitReachedException();
					const mockProductToReturn = createMockUntappdProduct({
						vmp_id: vmpId,
						untappd_id: untappdId,
						num_ratings: 897,
					});
					return Promise.resolve(mockProductToReturn);
				});
			await productRepository.save([mockProduct1, mockProduct2, mockProduct3], {
				listeners: false,
			});

			await expect(
				productsService.updateOldestUntappdProducts(),
			).resolves.not.toThrow();

			const products = await productRepository.find();
			expect(products).toHaveLength(3);
			expect(products).toSatisfyAny(
				(product: VinmonopoletProduct) =>
					product.vmp_id === '2' && product.untappd?.num_ratings === 897,
			);
			expect(products).toSatisfyAny(
				(product: VinmonopoletProduct) =>
					product.vmp_id === '3' && product.untappd?.num_ratings === 897,
			);
			expect(products).toSatisfyAny(
				(product: VinmonopoletProduct) =>
					product.vmp_id === '1' && product.untappd?.num_ratings === 999,
			);
		});
	});

	describe('createUntappdProductForVinmonopoletProduct', () => {
		it('should successfully get and save a new untappd product for the given product', async () => {
			const mockVinmonopoletProduct = createMockVinmonopoletProduct({
				vmp_id: '1',
				untappd: undefined,
			});
			const mockUntappdProduct = createMockUntappdProduct({
				vmp_id: '1',
				untappd_id: '2',
			});
			await productRepository.save(mockVinmonopoletProduct);
			jest
				.spyOn(untappdService, 'getUntappdProduct')
				.mockResolvedValue(mockUntappdProduct);

			await productsService.createUntappdProductForVinmonopoletProduct(
				'1',
				'2',
			);
			const savedProduct = await productRepository.find();

			expect(savedProduct).toHaveLength(1);
			expect(savedProduct[0].untappd?.untappd_id).toBe('2');
			expect(savedProduct[0].untappd?.vmp_id).toBe('1');
		});

		it('if updating a product that already has an associated untappd product, it should replace it with the new product.', async () => {
			const mockVinmonopoletProduct = createMockVinmonopoletProduct({
				vmp_id: '1',
				untappd: createMockUntappdProduct({
					untappd_id: '2',
					untappd_name: 'old beer',
				}),
			});
			const mockUntappdProduct = createMockUntappdProduct({
				untappd_name: 'new beer',
				vmp_id: '1',
				untappd_id: '3',
			});
			await productRepository.save(mockVinmonopoletProduct);
			jest
				.spyOn(untappdService, 'getUntappdProduct')
				.mockResolvedValue(mockUntappdProduct);

			await productsService.createUntappdProductForVinmonopoletProduct(
				'1',
				'3',
			);
			const savedProduct = await productRepository.find();
			const untappdProducts = await untappdRepository.find();

			expect(savedProduct).toHaveLength(1);
			expect(untappdProducts).toHaveLength(1);
			expect(savedProduct[0].untappd?.untappd_id).toBe('3');
			expect(savedProduct[0].untappd?.vmp_id).toBe('1');
		});
	});

	describe('deleteUntappdProduct', () => {
		it('Should delete untappd product', async () => {
			const mockVinmonopoletProduct = createMockVinmonopoletProduct({
				vmp_id: '1',
				untappd: createMockUntappdProduct({ vmp_id: '1', untappd_id: '2' }),
			});
			await productRepository.save(mockVinmonopoletProduct);

			await productsService.deleteUntappdProduct('1');
			const product = await productRepository.findBy({ vmp_id: '1' });

			expect(product[0].untappd).toBeNull();
		});
	});
});
