import { DatabaseModule } from '@modules/database/database.module';
import { UpcomingProduct } from '@modules/products/entities/upcomingProduct.entity';
import { ProductsRepository } from '@modules/products/repositories/products.repository';
import { UpcomingProductRepository } from '@modules/products/repositories/upcomingProduct.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { getDateWithoutTime } from '@utils/getDateWithoutTime';
import { postgresClient } from 'test/initIntegrationTestEnvironment';
import {
	mockUpcomingVinmonopoletProduct1,
	mockUpcomingVinmonopoletProduct2,
	mockUpcomingVinmonopoletProduct3,
	mockUpcomingVinmonopoletProductWithoutUntappdProduct,
} from 'test/mocks/mockProducts';

describe('upcomingProductRepository', () => {
	let productRepository: ProductsRepository;
	let upcomingProductRepository: UpcomingProductRepository;
	let testingModule: TestingModule;

	const getCurrentDatePlusDays = (days: number) => {
		const now = new Date();
		const releaseDate = new Date();
		releaseDate.setDate(now.getDate() + days);

		return releaseDate;
	};

	const compareReleaseDates = (a: Date, b: Date) => {
		return (
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDay() === b.getDay()
		);
	};

	const getExpectedAvailabilityText = (releaseDate: Date) => {
		const date = new Date(releaseDate);
		const options: Intl.DateTimeFormatOptions = {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		};

		return `Lanseres ${date.toLocaleDateString('nb-NO', options)}`;
	};

	beforeAll(async () => {
		testingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			providers: [ProductsRepository, UpcomingProductRepository],
		}).compile();

		productRepository =
			testingModule.get<ProductsRepository>(ProductsRepository);

		upcomingProductRepository = testingModule.get<UpcomingProductRepository>(
			UpcomingProductRepository,
		);
	});

	afterAll(async () => {
		await testingModule.close();
	});

	afterEach(async () => {
		await postgresClient.query('DELETE FROM vinmonopolet_products');
	});

	describe('saveUpcomingProduct', () => {
		it('should save upcoming product', async () => {
			const releaseDate = getCurrentDatePlusDays(1);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct1);

			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(mockUpcomingVinmonopoletProduct1, releaseDate),
			);
		});

		it('should update release date on conflict', async () => {
			const oldReleaseDate = getCurrentDatePlusDays(1);
			const newReleaseDate = getCurrentDatePlusDays(2);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct1);

			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(mockUpcomingVinmonopoletProduct1, oldReleaseDate),
			);
			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(mockUpcomingVinmonopoletProduct1, newReleaseDate),
			);

			const upcomingProducts =
				await upcomingProductRepository.getUpcomingProducts();

			expect(
				compareReleaseDates(upcomingProducts[0].releaseDate, newReleaseDate),
			).toBeTrue;
		});
	});

	describe('getUpcomingProducts', () => {
		it('should get all upcoming products', async () => {
			const releaseDate = getCurrentDatePlusDays(1);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct1);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct2);
			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(mockUpcomingVinmonopoletProduct1, releaseDate),
			);
			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(mockUpcomingVinmonopoletProduct2, releaseDate),
			);

			const upcomingProducts =
				await upcomingProductRepository.getUpcomingProducts();

			expect(upcomingProducts).toHaveLength(2);
			expect(
				upcomingProducts.every((upcomingProduct) =>
					compareReleaseDates(upcomingProduct.releaseDate, releaseDate),
				),
			).toBeTrue;
			expect(
				upcomingProducts.every(
					(upcomingProduct) =>
						upcomingProduct.vinmonopoletProduct.availablity ===
						getExpectedAvailabilityText(releaseDate),
				),
			);
		});

		it('should only get products with a release date in the future', async () => {
			const releaseDate = getCurrentDatePlusDays(1);
			const previousReleaseDate = getCurrentDatePlusDays(-1);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct1);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct2);
			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(
					mockUpcomingVinmonopoletProduct1,
					previousReleaseDate,
				),
			);
			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(mockUpcomingVinmonopoletProduct2, releaseDate),
			);

			const upcomingProducts =
				await upcomingProductRepository.getUpcomingProducts();

			expect(upcomingProducts).toHaveLength(1);
			expect(upcomingProducts[0].vinmonopoletProduct.vmp_id).toBe(
				mockUpcomingVinmonopoletProduct2.vmp_id,
			);
			expect(compareReleaseDates(upcomingProducts[0].releaseDate, releaseDate))
				.toBeTrue;
		});
	});

	describe('getAllReleaseDates', () => {
		it('should get all DISTINCT release dates', async () => {
			const futureReleaseDate = getCurrentDatePlusDays(5);
			const pastReleasedDate = getCurrentDatePlusDays(-5);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct1);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct2);
			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(
					mockUpcomingVinmonopoletProduct1,
					futureReleaseDate,
				),
			);
			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(mockUpcomingVinmonopoletProduct2, pastReleasedDate),
			);

			const releaseDates = await upcomingProductRepository.getAllReleaseDates();

			const sortedReleaseDates = releaseDates.sort((a, b) => (a < b ? 1 : -1));
			expect(sortedReleaseDates).toHaveLength(2);
			expect(sortedReleaseDates[0]).toEqualDateIgnoringTime(futureReleaseDate);
			expect(sortedReleaseDates[1]).toEqualDateIgnoringTime(pastReleasedDate);
		});
	});

	describe('getProductsInRelease', () => {
		it('should return all upcoming products with the given release date', async () => {
			const release1 = new Date(2024, 10, 23);
			const release2 = new Date(2023, 9, 10);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct1);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct2);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct3);
			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(mockUpcomingVinmonopoletProduct1, release1),
			);
			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(mockUpcomingVinmonopoletProduct2, release1),
			);
			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(mockUpcomingVinmonopoletProduct3, release2),
			);

			const release1Products =
				await upcomingProductRepository.getUpcomingProductsInRelease(release1);
			const release2Products =
				await upcomingProductRepository.getUpcomingProductsInRelease(release2);

			expect(release1Products).toHaveLength(2);
			expect(release2Products).toHaveLength(1);
		});

		it('should only return products with an associated untappd product', async () => {
			const release = new Date(2024, 10, 23);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct1);
			await productRepository.saveProduct(
				mockUpcomingVinmonopoletProductWithoutUntappdProduct,
			);
			await productRepository.saveProduct(mockUpcomingVinmonopoletProduct3);
			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(mockUpcomingVinmonopoletProduct1, release),
			);
			await upcomingProductRepository.saveUpcomingProduct(
				new UpcomingProduct(
					mockUpcomingVinmonopoletProductWithoutUntappdProduct,
					release,
				),
			);

			const releaseProducts =
				await upcomingProductRepository.getUpcomingProductsInRelease(release);

			expect(releaseProducts).toHaveLength(1);
			expect(releaseProducts[0].vinmonopoletProduct.vmp_id).toBe(
				mockUpcomingVinmonopoletProduct1.vmp_id,
			);
		});
	});
});
