import { UpcomingProduct } from '@modules/products/entities/upcomingProduct.entity';
import { UpcomingProductRepository } from '@modules/products/repositories/upcomingProduct.repository';
import { Injectable } from '@nestjs/common';
import { getDateWithoutTime } from '@utils/getDateWithoutTime';

@Injectable()
export class ReleasesService {
	constructor(
		private readonly upcomingProductsRepository: UpcomingProductRepository,
	) {}

	async getAllReleases() {
		const allReleases =
			await this.upcomingProductsRepository.getAllReleaseDates();

		return {
			upcomingRelease: this.getUpcomingReleases(allReleases),
			previousReleases: this.getPreviousReleases(allReleases),
		};
	}

	async getProductsInRelease(releaseDate: Date): Promise<UpcomingProduct[]> {
		return this.upcomingProductsRepository.getUpcomingProductsInRelease(
			releaseDate,
		);
	}

	private getUpcomingReleases(allReleases: Date[]) {
		return allReleases.filter(
			(release) =>
				getDateWithoutTime(release) >= getDateWithoutTime(new Date()),
		);
	}

	private getPreviousReleases(allReleases: Date[]) {
		return allReleases.filter(
			(release) => getDateWithoutTime(release) < getDateWithoutTime(new Date()),
		);
	}
}
