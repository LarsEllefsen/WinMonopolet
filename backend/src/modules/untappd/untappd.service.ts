import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';
import { UntappdClient } from './untappdClient';
import {
	mapToUntappdProduct,
	mapToUser,
	mapToUserProductsWithPagination,
	mapToUserWishlistProductsWithTotalCount,
} from './mapper';
import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { stripWords } from '@utils/stripWords';
import { Word } from '@modules/wordlist/entities/word';
import { UntappdSearchProductDTO } from './dto/UntappdSearchProductDTO';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { GetBeerInfoResponseDTO } from './dto/GetBeerInfoResponseDTO';
import { validate } from 'class-validator';
import { APILimitReachedException } from '@exceptions/APILimitReachedException';
import { UserProduct } from '@modules/users/entities/userProduct.entity';
import { User } from '@modules/users/entities/user.entity';
import { UserWishlistProduct } from '@modules/users/entities/userWishlistProduct.entity';

@Injectable()
export class UntappdService {
	constructor(private readonly untappdClient: UntappdClient) {}

	private readonly logger = new Logger(UntappdService.name);

	private async search(
		query: string,
		wordsToStrip?: Word[],
	): Promise<UntappdSearchProductDTO | undefined> {
		const { remainingApiCalls, searchResult } = await firstValueFrom(
			this.untappdClient.search(query),
		);

		// We are out of API calls, so we cant get beer info even if we had a match.
		if (remainingApiCalls === 0) return undefined;

		// If we have enough remaining API calls, re-try search with common words stripped
		if (searchResult.found === 0 && remainingApiCalls >= 2 && wordsToStrip) {
			// TODO
			const modifiedQuery = stripWords(query, wordsToStrip);
			const { searchResult } = await firstValueFrom(
				this.untappdClient.search(modifiedQuery),
			);

			return searchResult.beers.items[0];
		}

		return searchResult.beers.items[0];
	}

	private async getBeerInfo(
		untappdId: string,
	): Promise<GetBeerInfoResponseDTO> {
		const getBeerInfoResponseDTO = await firstValueFrom(
			this.untappdClient.getBeerInfo(untappdId),
		);

		await this.validateGetBeerInfoResponseDTO(getBeerInfoResponseDTO);

		return getBeerInfoResponseDTO;
	}

	async getUntappdProduct(untappdId: string, vmpId: string) {
		try {
			const { beer } = await this.getBeerInfo(untappdId);
			return mapToUntappdProduct(beer, vmpId);
		} catch (error) {
			if (!(error instanceof APILimitReachedException))
				this.logger.error(
					`Unable to find untappd product for  untappd_id: ${untappdId}: ${
						error?.message ?? error
					}`,
					error?.stack,
				);
			throw error;
		}
	}

	async tryToFindMatchingUntappdProduct(
		vinmonopoletProduct: VinmonopoletProduct,
		wordsToStrip?: Word[],
	): Promise<UntappdProduct | undefined> {
		const closestMatch = await this.search(
			vinmonopoletProduct.vmp_name,
			wordsToStrip,
		);

		if (!closestMatch) return undefined;

		const beerId = closestMatch.beer.bid.toString();
		const { beer } = await this.getBeerInfo(beerId);

		return mapToUntappdProduct(beer, vinmonopoletProduct.vmp_id);
	}

	async getUserInfo(accessToken: string) {
		return firstValueFrom(
			this.untappdClient.getUserInfo(accessToken).pipe(map(mapToUser)),
		);
	}

	async getUserProducts(user: User, offset: number) {
		let totalUserProducts = offset + 1;
		let userProducts: UserProduct[] = [];

		while (offset < totalUserProducts) {
			const { response, remainingApiCalls } =
				await this.getUserProductsWithOffset(user, offset);
			totalUserProducts = response.totalCount;
			userProducts = [...userProducts, ...response.products];

			if (remainingApiCalls <= 5 || !response.nextOffset) break;
			offset = response.nextOffset;
		}

		return {
			userProducts,
			totalUserProducts,
		};
	}

	async getUserWishlist(user: User, offset: number) {
		let totalWishlistProducts = offset + 1;
		let wishlistProducts: UserWishlistProduct[] = [];

		while (offset < totalWishlistProducts) {
			const { response, remainingApiCalls } =
				await this.getWishlistProductsWithOffset(user, offset);
			totalWishlistProducts = response.totalCount;
			wishlistProducts = [...wishlistProducts, ...response.products];

			if (remainingApiCalls <= 5 || offset >= response.totalCount) break;
			offset += 50;
		}

		return {
			wishlistProducts,
			totalWishlistProducts,
		};
	}

	private async getUserProductsWithOffset(user: User, offset: number) {
		return firstValueFrom(
			this.untappdClient.getUserProducts(offset, user.accessToken).pipe(
				map(({ body, remainingApiCalls }) => ({
					response: mapToUserProductsWithPagination(body, user.id),
					remainingApiCalls,
				})),
			),
		);
	}

	private async getWishlistProductsWithOffset(user: User, offset: number) {
		return firstValueFrom(
			this.untappdClient.getUserWishlistProducts(offset, user.accessToken).pipe(
				map(({ body, remainingApiCalls }) => ({
					response: mapToUserWishlistProductsWithTotalCount(body, user.id),
					remainingApiCalls,
				})),
			),
		);
	}

	private async validateGetBeerInfoResponseDTO(
		getBeerInfoResponseDTO: GetBeerInfoResponseDTO,
	) {
		const validationErrors = await validate(getBeerInfoResponseDTO);

		if (validationErrors.length > 0) {
			throw new Error(
				'Validation of GetBeerInfoResponseDTO failed: ' + validationErrors,
			);
		}
	}
}
