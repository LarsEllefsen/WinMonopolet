import { Test, TestingModule } from '@nestjs/testing';
import { VinmonopoletService } from '@modules/vinmonopolet/vinmonopolet.service';
import { Logger } from '@nestjs/common';
import { mocked } from 'jest-mock';
import {
	createMockVinmonopoletProductDTO,
	createMockVinmonopoletSearchResult,
} from 'test/utils/createMockData';
import {
	Facet,
	getAllStores,
	getProducts,
	getProductsByStore,
	VinmonopoletError,
} from 'vinmonopolet-ts';

jest.mock('vinmonopolet-ts', () => ({
	...jest.requireActual('vinmonopolet-ts'),
	getAllStores: jest.fn(),
	getProducts: jest.fn(),
	getProductsByStore: jest.fn(),
}));

describe('vinmonopoletService', () => {
	let vinmonopoletService: VinmonopoletService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [VinmonopoletService],
		}).compile();

		vinmonopoletService = module.get<VinmonopoletService>(VinmonopoletService);
	});

	describe('getAllProducts', () => {
		it('should collect all of the paginated response and return it as one array ', async () => {
			const mockResponse = createMockVinmonopoletSearchResult({
				mockProductsToReturn: [createMockVinmonopoletProductDTO({})],
				totalPages: 10,
			});

			const mockGetAllProducts =
				mocked(getProducts).mockResolvedValue(mockResponse);

			const allProducts = await vinmonopoletService.getAllProducts(
				[Facet.Category.BEER],
				false,
			);

			expect(allProducts).toHaveLength(10);
			expect(mockGetAllProducts).toHaveBeenCalledTimes(10);
		});

		it('should validate all products and throw if it does not conform to expectations', async () => {
			const mockVinmonopoletProductDTO = createMockVinmonopoletProductDTO({});
			//@ts-expect-error - We are checking for runtime errors
			mockVinmonopoletProductDTO.code = null;
			const mockResponse = createMockVinmonopoletSearchResult({
				mockProductsToReturn: [mockVinmonopoletProductDTO],
				totalPages: 1,
			});
			mocked(getProducts).mockResolvedValue(mockResponse);

			expect(
				vinmonopoletService.getAllProducts([Facet.Category.BEER], false),
			).rejects.toThrow(
				'property code has failed the following constraints: isString, isNotEmpty',
			);
		});

		it('should log and rethrow VinmonopoletError', async () => {
			const error = new VinmonopoletError('Service unavailable', 503);
			mocked(getProducts).mockRejectedValue(error);
			const loggerSpy = jest
				.spyOn(Logger.prototype, 'error')
				.mockImplementation(() => undefined);

			await expect(
				vinmonopoletService.getAllProducts([Facet.Category.BEER], false),
			).rejects.toThrow(error);

			expect(loggerSpy).toHaveBeenCalledWith(
				'getProducts failed with status 503: Service unavailable',
			);
		});
	});

	describe('getAllProductsByStore', () => {
		it('should collect all of the paginated response and return it as one array ', async () => {
			const mockResponse = createMockVinmonopoletSearchResult({
				mockProductsToReturn: [createMockVinmonopoletProductDTO({})],
				totalPages: 10,
			});

			const mockGetAllProducts = mocked(getProductsByStore).mockResolvedValue({
				...mockResponse,
				store: '160',
			});

			const allProducts = await vinmonopoletService.getAllProductsByStore(
				'160',
				Facet.Category.BEER,
				false,
			);

			expect(allProducts).toHaveLength(10);
			expect(mockGetAllProducts).toHaveBeenCalledTimes(10);
		});

		it('should log and rethrow VinmonopoletError', async () => {
			const error = new VinmonopoletError('Service unavailable', 503);
			mocked(getProductsByStore).mockRejectedValue(error);
			const loggerSpy = jest
				.spyOn(Logger.prototype, 'error')
				.mockImplementation(() => undefined);

			await expect(
				vinmonopoletService.getAllProductsByStore('160', Facet.Category.BEER, false),
			).rejects.toThrow(error);

			expect(loggerSpy).toHaveBeenCalledWith(
				'getProductsByStore failed with status 503: Service unavailable',
			);
		});
	});

	describe('getAllStores', () => {
		it('should log and rethrow VinmonopoletError', async () => {
			const error = new VinmonopoletError('Service unavailable', 503);
			mocked(getAllStores).mockRejectedValue(error);
			const loggerSpy = jest
				.spyOn(Logger.prototype, 'error')
				.mockImplementation(() => undefined);

			await expect(vinmonopoletService.getAllStores()).rejects.toThrow(error);

			expect(loggerSpy).toHaveBeenCalledWith(
				'getAllStores failed with status 503: Service unavailable',
			);
		});
	});
});
