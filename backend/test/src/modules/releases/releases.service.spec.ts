import { TestBed } from '@automock/jest';
import { UpcomingProductRepository } from '@modules/products/repositories/upcomingProduct.repository';
import { ReleasesService } from '@modules/releases/releases.service';

describe('releasesService', () => {
	let releasesService: ReleasesService;
	let upcomingProductsRepository: UpcomingProductRepository;

	beforeAll(() => {
		const { unit, unitRef } = TestBed.create(ReleasesService).compile();

		releasesService = unit;
		upcomingProductsRepository = unitRef.get(UpcomingProductRepository);
	});

	describe('getAllReleases', () => {
		it('should return all previous releases and all upcoming releases', async () => {
			const mockPreviousRelease1 = new Date(2020, 10, 30);
			const mockPreviousRelease2 = new Date(2021, 10, 30);
			const mockFutureRelease = new Date();
			mockFutureRelease.setDate(mockFutureRelease.getDate() + 5);
			jest
				.spyOn(upcomingProductsRepository, 'getAllReleaseDates')
				.mockResolvedValue([
					mockPreviousRelease1,
					mockPreviousRelease2,
					mockFutureRelease,
				]);

			const releases = await releasesService.getAllReleases();

			expect(releases.upcomingRelease).toHaveLength(1);
			expect(releases.upcomingRelease[0]).toBe(mockFutureRelease);
			expect(releases.previousReleases).toHaveLength(2);
			expect(releases.previousReleases).toSatisfyAny(
				(date) => date === mockPreviousRelease1,
			);
			expect(releases.previousReleases).toSatisfyAny(
				(date) => date === mockPreviousRelease2,
			);
		});

		it('any relases with todays date should be considered an upcoming release', async () => {
			const mockPreviousRelease1 = new Date(2020, 10, 30);
			const mockPreviousRelease2 = new Date(2021, 10, 30);
			const today = new Date();
			jest
				.spyOn(upcomingProductsRepository, 'getAllReleaseDates')
				.mockResolvedValue([mockPreviousRelease1, mockPreviousRelease2, today]);

			const releases = await releasesService.getAllReleases();

			expect(releases.upcomingRelease).toHaveLength(1);
			expect(releases.upcomingRelease[0]).toBe(today);
			expect(releases.previousReleases).toHaveLength(2);
			expect(releases.previousReleases).toSatisfyAny(
				(date) => date === mockPreviousRelease1,
			);
			expect(releases.previousReleases).toSatisfyAny(
				(date) => date === mockPreviousRelease2,
			);
		});
	});
});
