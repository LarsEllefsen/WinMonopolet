import { Injectable, Logger } from '@nestjs/common';
import { UntappdClient } from './untappdClient';
import { mapToUntappdProduct } from './mapper';
import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { stripWords } from '@utils/stripWords';
import { Word } from '@modules/wordlist/entities/word';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { APILimitReachedException } from '@exceptions/APILimitReachedException';

@Injectable()
export class UntappdService {
	constructor(private readonly untappdClient: UntappdClient) {}

	private readonly logger = new Logger(UntappdService.name);

	private async search(query: string, wordsToStrip?: Word[]) {
		const { remainingAPICalls, searchResult } = await this.untappdClient.search(
			query,
		);

		// We are out of API calls, so we cant get beer info even if we had a match.
		if (remainingAPICalls === 0) return undefined;

		// If we have enough remaining API calls, re-try search with common words stripped
		if (searchResult.length === 0 && remainingAPICalls >= 2 && wordsToStrip) {
			// TODO
			const modifiedQuery = stripWords(query, wordsToStrip);
			const { searchResult } = await this.untappdClient.search(modifiedQuery);

			return searchResult[0];
		}

		return searchResult[0];
	}

	private async getBeer(id: string) {
		const { beer } = await this.untappdClient.getBeerInfo(id);
		if (beer === null) {
			throw new Error(`Unable to find beer with untappd id ${id}`);
		}
		return beer;
	}

	async getUntappdProduct(untappdId: string, vmpId: string) {
		try {
			const beer = await this.getBeer(untappdId);
			return mapToUntappdProduct(beer, vmpId);
		} catch (error) {
			if (!(error instanceof APILimitReachedException))
				this.logger.error(
					`Unable to find untappd product for untappd_id: ${untappdId}: ${
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

		const id = closestMatch.id;
		const beer = await this.getBeer(id);

		return mapToUntappdProduct(beer, vinmonopoletProduct.vmp_id);
	}
}
