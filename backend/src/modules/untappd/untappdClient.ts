import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APILimitReachedException } from '@exceptions/APILimitReachedException';
import { TooManyRequestsException } from '@exceptions/TooManyRequestsException';
import {
	UntappdClient as _UntappdClient,
	Beer,
	HTTPException,
	SearchResult,
} from 'untappd-node';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UntappdClient {
	client: _UntappdClient;
	remainingAPICalls: number;

	constructor(private configService: ConfigService) {
		this.client = new _UntappdClient({
			baseUrl: configService.get('UNTAPPD_BASE_URL') ?? 'https://untappd.com',
		});
		this.remainingAPICalls = 100;
	}

	private readonly logger = new Logger(UntappdClient.name);
	private readonly DELAY = 2500;

	async search(
		query: string,
		delay = this.DELAY,
	): Promise<{ remainingAPICalls: number; searchResult: SearchResult[] }> {
		const searchResult = await this.GET(() => this.client.searchBeers(query));
		return new Promise((resolve) =>
			setTimeout(
				() =>
					resolve({ remainingAPICalls: this.remainingAPICalls, searchResult }),
				delay,
			),
		);
	}

	async getBeerInfo(
		id: string,
		delay = this.DELAY,
	): Promise<{ remainingAPICalls: number; beer: Beer | null }> {
		const beer = await this.GET(() => this.client.getBeer(id));
		return new Promise((resolve) =>
			setTimeout(
				() => resolve({ remainingAPICalls: this.remainingAPICalls, beer }),
				delay,
			),
		);
	}

	private async GET<T>(fn: () => Promise<T>): Promise<T> {
		if (this.remainingAPICalls === 0) {
			throw new APILimitReachedException();
		}

		try {
			const response = await fn();
			this.remainingAPICalls--;
			return response;
		} catch (error) {
			this.exceptionMapper(error as Error);
		}
	}

	private exceptionMapper(error: Error): never {
		const statusCode = error instanceof HTTPException ? error.statusCode : 500;
		switch (statusCode) {
			case 400:
				throw new BadRequestException(error.message);
			case 401:
				throw new UnauthorizedException(error.message);
			case 403:
				throw new ForbiddenException(error.message);
			case 404:
				throw new NotFoundException(error.message);
			case 429: {
				throw new TooManyRequestsException();
			}
			default:
				throw new InternalServerErrorException(error.message);
		}
	}

	@Cron(CronExpression.EVERY_HOUR)
	private resetRemainingAPICalls() {
		this.logger.log('Resetting remaining API calls back to 100');
		this.remainingAPICalls = 100;
	}
}
