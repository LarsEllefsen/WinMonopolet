import { UntappdService } from '@modules/untappd/untappd.service';
import { UntappdClient } from '@modules/untappd/untappdClient';
import { Beer } from 'untappd-node';
import { APILimitReachedException } from '@exceptions/APILimitReachedException';
import { TestBed } from '@automock/jest';

describe('UntappdService', () => {
	let untappdService: UntappdService;
	let untappdClient: UntappdClient;

	const mockBeerResponse = {
		id: '123',
		name: 'Test Beer',
		style: 'Test Ale',
		abv: 6.5,
		image: 'https://test.com/image.png',
		numRatings: 100,
		rating: 4.24,
		brewery: 'Test Brewery',
		url: 'https://test.com',
	} satisfies Beer;

	beforeAll(async () => {
		const { unit, unitRef } = TestBed.create(UntappdService).compile();

		untappdService = unit;
		untappdClient = unitRef.get<UntappdClient>(UntappdClient);
	});

	describe('getUntappdProduct', () => {
		it('should return untappd product', async () => {
			jest
				.spyOn(untappdClient, 'getBeerInfo')
				.mockResolvedValue({ remainingAPICalls: 100, beer: mockBeerResponse });

			const untappdProduct = await untappdService.getUntappdProduct(
				'123',
				'321',
			);

			expect(untappdProduct.untappd_id).toBe(mockBeerResponse.id);
			expect(untappdProduct.vmp_id).toBe('321');
			expect(untappdProduct.untappd_name).toBe(mockBeerResponse.name);
			expect(untappdProduct.style).toBe(mockBeerResponse.style);
			expect(untappdProduct.brewery).toBe(mockBeerResponse.brewery);
			expect(untappdProduct.abv).toBe(6.5);
			expect(untappdProduct.rating).toBe(mockBeerResponse.rating);
			expect(untappdProduct.num_ratings).toBe(mockBeerResponse.numRatings);
			expect(untappdProduct.untappd_url).toBe(mockBeerResponse.url);
			expect(untappdProduct.picture_url).toBe(mockBeerResponse.image);
		});

		it('should throw if return value was null', async () => {
			jest
				.spyOn(untappdClient, 'getBeerInfo')
				.mockResolvedValue({ remainingAPICalls: 100, beer: null });

			expect(untappdService.getUntappdProduct('123', '321')).rejects.toThrow(
				'Unable to find beer with untappd id 123',
			);
		});

		it('should re-throw APILimitReached exception', async () => {
			jest.spyOn(untappdClient, 'getBeerInfo').mockImplementation(() => {
				throw new APILimitReachedException();
			});

			expect(untappdService.getUntappdProduct('123', '321')).rejects.toThrow(
				'API limit reached',
			);
		});
	});
});
