import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import {
	createMockUntappdProduct,
	createMockVinmonopoletProduct,
} from 'test/utils/mockData';
import setupTestDatabase from 'test/utils/setupTestDatabase';
import { Repository } from 'typeorm';

describe('productRepository', () => {
	let productRepository: Repository<VinmonopoletProduct>;
	let untappdRepository: Repository<UntappdProduct>;

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [
				setupTestDatabase,
				TypeOrmModule.forFeature([VinmonopoletProduct]),
				TypeOrmModule.forFeature([UntappdProduct]),
			],
		}).compile();

		productRepository = module.get<Repository<VinmonopoletProduct>>(
			getRepositoryToken(VinmonopoletProduct),
		);
		untappdRepository = module.get<Repository<UntappdProduct>>(
			getRepositoryToken(UntappdProduct),
		);
	});

	afterEach(async () => {
		await untappdRepository.query('TRUNCATE untappd_products CASCADE');
		await productRepository.query('TRUNCATE vinmonopolet_products CASCADE');
		jest.resetAllMocks();
	});

	it('should generate timestamp when saving a new entity that doesnt exist in the database yet', async () => {
		const mockProduct = createMockVinmonopoletProduct({});
		mockProduct.added_date = undefined;
		mockProduct.last_updated = undefined;
		const currentDate = new Date();

		const savedProducts = await productRepository.save(mockProduct);

		expect(savedProducts?.added_date).toBeTruthy();
		expect(savedProducts?.added_date?.getFullYear()).toBe(
			currentDate.getFullYear(),
		);
		expect(savedProducts?.added_date?.getMonth()).toBe(currentDate.getMonth());
		expect(savedProducts?.added_date?.getDate()).toBe(currentDate.getDate());

		expect(savedProducts?.last_updated).toBeTruthy();
		expect(savedProducts?.last_updated?.getFullYear()).toBe(
			currentDate.getFullYear(),
		);
		expect(savedProducts?.last_updated?.getMonth()).toBe(
			currentDate.getMonth(),
		);
		expect(savedProducts?.last_updated?.getDate()).toBe(currentDate.getDate());
	});

	it('should update product when entity already exists in the database, and undefined values should be ignored', async () => {
		const addedDate = new Date('2022-10-23');
		const dateNow = new Date();
		const mockProduct = createMockVinmonopoletProduct({
			vmp_url: 'www.test.no',
		});
		mockProduct.added_date = addedDate;
		await productRepository.save(mockProduct);
		const updatedProduct = mockProduct;
		updatedProduct.added_date = undefined;
		updatedProduct.price = 690.99;
		updatedProduct.vmp_name = 'Paragon 2023';

		await productRepository.save(updatedProduct);
		const products = await productRepository.find();

		expect(products).toHaveLength(1);
		expect(products[0].added_date?.getFullYear()).toBe(addedDate.getFullYear());
		expect(products[0].added_date?.getMonth()).toBe(addedDate.getMonth());
		expect(products[0].added_date?.getDate()).toBe(addedDate.getDate());
		expect(products[0].last_updated?.getFullYear()).toBe(dateNow.getFullYear());
		expect(products[0].last_updated?.getMonth()).toBe(dateNow.getMonth());
		expect(products[0].last_updated?.getDate()).toBe(dateNow.getDate());
		expect(products[0].price).toBe(690.99);
		expect(products[0].vmp_name).toBe('Paragon 2023');
		expect(products[0].vmp_url).toBe('www.test.no');
	});

	it('should save untappd product', async () => {
		const mockUntappdProduct = createMockUntappdProduct({
			vmp_id: '123',
			untappd_id: '111',
		});
		const mockVinmonopoletProduct = createMockVinmonopoletProduct({
			vmp_id: '123',
			untappd: mockUntappdProduct,
		});

		await productRepository.save(mockVinmonopoletProduct);
		const products = await productRepository.find();

		expect(products).toHaveLength(1);
		expect(products[0].untappd).not.toBeUndefined();
		expect(products[0].untappd?.untappd_id).toBe('111');
		expect(products[0].untappd?.vmp_id).toBe('123');
	});

	it('if untappd product is undefined, ignore and only update vinmonopolet product', async () => {
		const mockVinmonopoletProduct = createMockVinmonopoletProduct({
			vmp_id: '123',
			price: 69.9,
			untappd: undefined,
		});
		const mockUntappdProduct = createMockUntappdProduct({ vmp_id: '123' });

		mockVinmonopoletProduct.untappd = mockUntappdProduct;
		await productRepository.save(mockVinmonopoletProduct);
		mockVinmonopoletProduct.untappd = undefined;
		mockVinmonopoletProduct.price = 420;
		await productRepository.save(mockVinmonopoletProduct);

		const retrievedProduct = await productRepository.findOne({
			where: { vmp_id: '123' },
		});

		expect(retrievedProduct?.untappd).toBeTruthy();
		expect(retrievedProduct?.untappd?.vmp_id).toBe('123');
		expect(retrievedProduct?.price).toBe(420);
	});

	it('should correctly save decimal values', async () => {
		const mockUntappdProduct = createMockUntappdProduct({
			vmp_id: '123',
			abv: 12.5,
			rating: 3.6942,
		});
		const mockVinmonopoletProduct = createMockVinmonopoletProduct({
			vmp_id: '123',
			price: 299.9,
			untappd: mockUntappdProduct,
		});

		await productRepository.save(mockVinmonopoletProduct);

		const products = await productRepository.find();
		expect(products).toHaveLength(1);
		expect(products[0].price).toBe(299.9);
		expect(products[0].untappd?.abv).toBe(12.5);
		expect(products[0].untappd?.rating).toBe(3.6942);
	});

	it('Can get products by untappd product LAST_UPDATED ascending', async () => {
		const mockProduct1 = createMockVinmonopoletProduct({
			vmp_id: '1',
			untappd: createMockUntappdProduct({
				untappd_id: '1',
				last_updated: new Date('2023-07-10T18:25:00'),
			}),
		});
		const mockProduct2 = createMockVinmonopoletProduct({
			vmp_id: '2',
			untappd: createMockUntappdProduct({
				untappd_id: '2',
				last_updated: new Date('2022-10-23T14:54:00'),
			}),
		});
		const mockProduct3 = createMockVinmonopoletProduct({
			vmp_id: '3',
			untappd: createMockUntappdProduct({
				untappd_id: '3',
				last_updated: new Date('2023-07-10T18:20:00'),
			}),
		});
		await productRepository.save([mockProduct1, mockProduct2, mockProduct3], {
			listeners: false,
		});

		const products = await productRepository.find({
			order: { untappd: { last_updated: 'ASC' } },
		});

		expect(products).toHaveLength(3);
		expect(products[0].vmp_id).toBe('2');
		expect(products[1].vmp_id).toBe('3');
		expect(products[2].vmp_id).toBe('1');
	});
});
