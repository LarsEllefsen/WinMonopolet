import { APILimitReachedException } from '@exceptions/APILimitReachedException';
import { HttpModule, HttpService } from '@nestjs/axios';
import {
	BadRequestException,
	ForbiddenException,
	HttpException,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UntappdClient } from '@modules/untappd/untappdClient';
import { throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

describe('UntappdClient', () => {
	let untappdClient: UntappdClient;
	let httpService: HttpService;

	const testScheduler = new TestScheduler((actual, expected) => {
		// asserting the two objects are equal - required
		// for TestScheduler assertions to work via your test framework
		// e.g. using chai.
		expect(actual).toEqual(expected);
	});

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [HttpModule],
			providers: [
				UntappdClient,
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn((key: string) => 'someValue'),
					},
				},
			],
		}).compile();

		untappdClient = module.get<UntappdClient>(UntappdClient);
		httpService = module.get<HttpService>(HttpService);
	});

	it.each([
		[400, new BadRequestException('Something went wrong')],
		[401, new UnauthorizedException('Something went wrong')],
		[403, new ForbiddenException('Something went wrong')],
		[404, new NotFoundException('Something went wrong')],
		[500, new InternalServerErrorException('Something went wrong')],
	])(
		'Should catch any http errors and throw appropriate exception',
		(errorCode, expectedException) => {
			jest
				.spyOn(httpService, 'get')
				.mockImplementation(() =>
					throwError(
						() => new HttpException('Something went wrong', errorCode),
					),
				);

			testScheduler.run((asd) => {
				const src$ = untappdClient.search('query');
				asd.expectObservable(src$).toBe('#', null, expectedException);
			});
		},
	);

	it('should catch APILimitReached exception', () => {
		jest
			.spyOn(httpService, 'get')
			.mockImplementation(() =>
				throwError(() => new APILimitReachedException()),
			);

		testScheduler.run((asd) => {
			const src$ = untappdClient.search('query');
			asd
				.expectObservable(src$)
				.toBe('#', null, new APILimitReachedException());
		});
	});
});
