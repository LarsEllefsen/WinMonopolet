import {
	BadRequestException,
	ForbiddenException,
	HttpException,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UntappdClient } from '@modules/untappd/untappdClient';
import { TestBed } from '@automock/jest';
import * as untappdNode from 'untappd-node';
import { APILimitReachedException } from '@exceptions/APILimitReachedException';

describe('UntappdClient', () => {
	let untappdClient: UntappdClient;

	beforeAll(async () => {
		const { unit } = TestBed.create(UntappdClient).compile();

		untappdClient = unit;
	});

	afterEach(() => {
		untappdClient.remainingAPICalls = 100;
	});

	it('should return search results', async () => {
		jest.spyOn(untappdNode, 'searchBeers').mockResolvedValue([
			{
				id: '1',
				name: 'First Matched Beer',
				brewery: 'Test Brewery',
				rating: 4.0,
				style: 'Test Porter',
				url: 'https://test.com',
				abv: 5,
			},
		]);

		const { searchResult, remainingAPICalls } = await untappdClient.search(
			'Test',
			0,
		);

		expect(searchResult).toHaveLength(1);
		expect(remainingAPICalls).toBe(99);
	});

	it('should return search results with delay', async () => {
		jest.spyOn(untappdNode, 'searchBeers').mockResolvedValue([
			{
				id: '1',
				name: 'First Matched Beer',
				brewery: 'Test Brewery',
				rating: 4.0,
				style: 'Test Porter',
				url: 'https://test.com',
				abv: 5,
			},
		]);

		const start = performance.now();

		const { searchResult, remainingAPICalls } = await untappdClient.search(
			'Test',
			1000,
		);

		const end = performance.now();

		expect(searchResult).toHaveLength(1);
		expect(remainingAPICalls).toBe(99);
		expect(end - start).toBeWithin(1000, 1500);
	});

	it.each<[number, HttpException]>([
		[400, new BadRequestException('Something went wrong')],
		[401, new UnauthorizedException('Something went wrong')],
		[403, new ForbiddenException('Something went wrong')],
		[404, new NotFoundException('Something went wrong')],
		[500, new InternalServerErrorException('Something went wrong')],
	])(
		'Should catch any http errors and throw appropriate exception',
		async (errorCode, expectedException) => {
			jest.spyOn(untappdNode, 'searchBeers').mockImplementation(() => {
				throw new untappdNode.HTTPException(errorCode, 'Something went wrong');
			});

			try {
				await untappdClient.search('123', 0);
			} catch (error) {
				const httpException = error as HttpException;
				expect(httpException).toStrictEqual(expectedException);
				expect(httpException.getStatus()).toBe(errorCode);
			}
		},
	);

	it('should decrease remainingAPICalls by one for each api call', async () => {
		jest.spyOn(untappdNode, 'searchBeers').mockResolvedValue([]);

		expect(untappdClient.remainingAPICalls).toBe(100);

		await untappdClient.search('3 fonteinen', 0);

		expect(untappdClient.remainingAPICalls).toBe(99);

		await untappdClient.search('3 fonteinen', 0);

		expect(untappdClient.remainingAPICalls).toBe(98);
	});

	it('should throw APILimitReachedException when remainingAPICalls reaches zero', async () => {
		jest.spyOn(untappdNode, 'searchBeers').mockImplementation(() => {
			throw new Error('Should not have been called');
		});
		untappdClient.remainingAPICalls = 0;

		try {
			await untappdClient.search('3 fonteinen', 0);
		} catch (error) {
			expect(error).toBeInstanceOf(APILimitReachedException);
		}
	});
});
