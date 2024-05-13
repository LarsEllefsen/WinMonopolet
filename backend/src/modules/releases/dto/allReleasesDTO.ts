export class AllReleasesDTO {
	constructor(upcomingReleases: Date[], previousReleases: Date[]) {
		this.upcomingReleases = upcomingReleases;

		this.previousReleases = previousReleases;
	}

	upcomingReleases: Date[];
	previousReleases: Date[];
}
