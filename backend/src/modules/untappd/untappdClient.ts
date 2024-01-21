import { HttpService } from '@nestjs/axios';
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
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, delay, map } from 'rxjs';
import { UntappdSearchResultDTO } from './dto/UntappdSearchResultDTO';
import { APILimitReachedException } from '@exceptions/APILimitReachedException';
import { X_RATELIMIT_REMAINING_HEADER } from '@common/constants';
import { TooManyRequestsException } from '@exceptions/TooManyRequestsException';
import { GetBeerInfoResponseDTO } from './dto/GetBeerInfoResponseDTO';
import { plainToInstance } from 'class-transformer';
import { UntappdUserDTO } from './dto/UntappdUserDTO';
import { GetUserProductResponseDTO } from './dto/GetUserProductResponseDTO';
import { GetUserWishlistProductResponseDTO } from './dto/GetUserWishlistProductsResponseDTO';

type UntappdApiError = {
	meta: {
		code: number;
		error_detail: string;
		error_type: string;
	};
};

@Injectable()
export class UntappdClient {
	baseUrl: string;
	clientId: string;
	clientSecret: string;
	baseQueryParams: Record<string, string>;

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
	) {
		this.baseUrl = this.getOrThrow('UNTAPPD_BASE_URL');
		this.clientId = this.getOrThrow('UNTAPPD_CLIENT_ID');
		this.clientSecret = this.getOrThrow('UNTAPPD_CLIENT_SECRET');
		this.baseQueryParams = {
			client_id: this.clientId,
			client_secret: this.clientSecret,
		};
	}

	private readonly logger = new Logger(UntappdClient.name);

	search(query: string) {
		const queryParams = {
			...this.baseQueryParams,
			q: query,
		};
		return this.GET<{ response: UntappdSearchResultDTO }>(
			'search/beer',
			queryParams,
		)
			.pipe(
				map((response) => ({
					remainingApiCalls: response.remainingApiCalls,
					searchResult: response.body.response,
				})),
			)
			.pipe(delay(2000));
	}

	getBeerInfo(untappd_id: string) {
		return this.GET<{ response: GetBeerInfoResponseDTO }>(
			`beer/info/${untappd_id}`,
			this.baseQueryParams,
		)
			.pipe(
				map(({ body }) =>
					plainToInstance(GetBeerInfoResponseDTO, body.response),
				),
			)
			.pipe(delay(2000));
	}

	getUserInfo(accessToken: string) {
		return this.GET<{ response: { user: UntappdUserDTO } }>(`user/info`, {
			access_token: accessToken,
		}).pipe(
			map(({ body }) => plainToInstance(UntappdUserDTO, body.response.user)),
		);
	}

	getUserProducts(offset: number, accessToken: string) {
		return this.GET<{ response: GetUserProductResponseDTO }>(`user/beers`, {
			access_token: accessToken,
			limit: 50,
			offset,
			sort: 'date_asc',
		})
			.pipe(
				map(({ body, remainingApiCalls }) => ({
					body: plainToInstance(GetUserProductResponseDTO, body.response),
					remainingApiCalls,
				})),
			)
			.pipe(delay(2000));
	}

	getUserWishlistProducts(offset: number, accessToken: string) {
		return this.GET<{ response: GetUserWishlistProductResponseDTO }>(
			`user/wishlist`,
			{
				access_token: accessToken,
				limit: 50,
				offset,
				sort: 'date_asc',
			},
		)
			.pipe(
				map(({ body, remainingApiCalls }) => ({
					body: plainToInstance(
						GetUserWishlistProductResponseDTO,
						body.response,
					),
					remainingApiCalls,
				})),
			)
			.pipe(delay(2000));
	}

	GET<T>(endpoint: string, params: Record<string, string | number | boolean>) {
		return this.httpService
			.get<T>(`${this.baseUrl}${endpoint}`, {
				params: params,
				headers: {
					'User-Agent': 'Winmonopolet',
				},
			})
			.pipe(
				catchError((error: AxiosError<UntappdApiError>) =>
					this.exceptionMapper(error),
				),
			)
			.pipe(map(this.toResponse))
			.pipe(
				map((res) => {
					this.logger.debug('Remaining api calls: ' + res.remainingApiCalls);
					if (res.remainingApiCalls === 0) throw new APILimitReachedException();
					return res;
				}),
			);
	}

	private toResponse<T>(axiosResponse: AxiosResponse<T, any>) {
		return {
			remainingApiCalls: Number(
				axiosResponse.headers[X_RATELIMIT_REMAINING_HEADER],
			),
			body: axiosResponse.data,
		};
	}

	private getOrThrow(propertyName: string) {
		const property = this.configService.get<string>(propertyName);
		if (property == undefined) {
			throw Error(`${propertyName} was not found as en environment variable.`);
		}
		return property;
	}

	private exceptionMapper(error: AxiosError<UntappdApiError>): never {
		const untappdErrorMetaData = error.response?.data?.meta;
		const errorMessage = untappdErrorMetaData?.error_detail ?? error?.message;
		switch (error.response?.status) {
			case 400:
				throw new BadRequestException(errorMessage, error?.message);
			case 401:
				throw new UnauthorizedException(errorMessage, error?.message);
			case 403:
				throw new ForbiddenException(errorMessage, error?.message);
			case 404:
				throw new NotFoundException(errorMessage, error?.message);
			case 429: {
				const remainingApiCalls =
					error.response?.headers[X_RATELIMIT_REMAINING_HEADER];
				if (
					(remainingApiCalls && remainingApiCalls === 0) ||
					remainingApiCalls === '0'
				) {
					throw new APILimitReachedException();
				}
				throw new TooManyRequestsException();
			}
			default:
				throw new InternalServerErrorException(errorMessage, error?.message);
		}
	}
}
