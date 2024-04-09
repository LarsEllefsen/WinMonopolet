import { Test, TestingModule } from '@nestjs/testing';
import { GetBeerInfoResponseDTO } from '@modules/untappd/dto/GetBeerInfoResponseDTO';
import { UntappdService } from '@modules/untappd/untappd.service';
import { UntappdClient } from '@modules/untappd/untappdClient';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import {
	createMockGetBeerInfoResponsetDTO,
	createMockUntappdUserProductDTO,
	createMockUser,
} from 'test/utils/createMockData';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('UntappdService', () => {
	let untappdService: UntappdService;
	let untappdClient: UntappdClient;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [],
			providers: [UntappdService],
		})
			.useMocker((token) => {
				const mockMetadata = moduleMocker.getMetadata(
					token,
				) as MockFunctionMetadata<any, any>;
				const Mock = moduleMocker.generateFromMetadata(mockMetadata);
				return new Mock();
			})
			.compile();

		untappdService = module.get<UntappdService>(UntappdService);
		untappdClient = module.get<UntappdClient>(UntappdClient);
	});

	describe('getUntappdProduct', () => {
		it('should fail validation if dto does not conform to expectations', async () => {
			const mockGetBeerInfoResponsetDTO = plainToInstance(
				GetBeerInfoResponseDTO,
				createMockGetBeerInfoResponsetDTO({}),
			);
			//@ts-expect-error - We are checking for runtime errors
			mockGetBeerInfoResponsetDTO.beer.bid = null;
			jest.spyOn(untappdClient, 'getBeerInfo').mockImplementation((args) => {
				return new Observable((subscriber) => {
					subscriber.next(mockGetBeerInfoResponsetDTO);
					subscriber.complete();
				});
			});

			expect(untappdService.getUntappdProduct('111', '123')).rejects.toThrow(
				'property beer.bid has failed the following constraints: isNumber, isNotEmpty',
			);
		});
	});

	describe('getUserProducts', () => {
		it('should collect all user products ', async () => {
			const mockUser = createMockUser({ id: '123' });
			jest
				.spyOn(untappdClient, 'getUserProducts')
				.mockImplementation((offset) => {
					const nextOffset = offset === 9 ? undefined : offset + 1;
					return new Observable((subscriber) => {
						subscriber.next({
							remainingApiCalls: 100,
							body: {
								beers: { count: 1, items: [createMockUntappdUserProductDTO()] },
								pagination: { offset: nextOffset },
								total_count: 10,
								sort_key: 'DATE',
							},
						});
						subscriber.complete();
					});
				});

			const response = await untappdService.getUserProducts(mockUser, 0);

			expect(response.userProducts).toHaveLength(10);
			expect(response.totalUserProducts).toBe(10);
		});

		it('should stop when there are 5 or fewer api calls remaining ', async () => {
			const mockUser = createMockUser({ id: '123' });
			let remainingApiCalls = 10;
			jest
				.spyOn(untappdClient, 'getUserProducts')
				.mockImplementation((offset) => {
					remainingApiCalls--;
					return new Observable((subscriber) => {
						subscriber.next({
							remainingApiCalls,
							body: {
								beers: { count: 1, items: [createMockUntappdUserProductDTO()] },
								pagination: { offset: offset + 1 },
								total_count: 100,
								sort_key: 'DATE',
							},
						});
						subscriber.complete();
					});
				});

			const response = await untappdService.getUserProducts(mockUser, 0);

			expect(response.userProducts).toHaveLength(5);
			expect(response.totalUserProducts).toBe(100);
		});
	});
});
