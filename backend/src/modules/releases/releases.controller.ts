import { Controller, Get, Param } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { UpcomingProduct } from '@modules/products/entities/upcomingProduct.entity';
import { AllReleasesDTO } from './dto/allReleasesDTO';

@Controller('releases')
export class ReleasesController {
	constructor(private readonly releasesService: ReleasesService) {}

	@Get()
	async getAllReleases(): Promise<AllReleasesDTO> {
		const releases = await this.releasesService.getAllReleases();

		return new AllReleasesDTO(
			releases.upcomingRelease,
			releases.previousReleases,
		);
	}

	@Get(':releaseDate')
	async getRelease(
		@Param('releaseDate') releaseDate: Date,
	): Promise<UpcomingProduct[]> {
		return this.releasesService.getProductsInRelease(releaseDate);
	}
}
