import { ProductsStatCollector } from '@modules/products/productsStatCollector';
import {
	createMockUntappdProduct,
	createMockVinmonopoletProduct,
} from 'test/utils/createMockData';

describe('ProductsStatCollector', () => {
	it('Should print statistics', () => {
		const productsStatCollector = new ProductsStatCollector();
		const foundNewUntappdProduct = [
			createMockVinmonopoletProduct({
				vmp_id: '1',
				vmp_name: 'Firestone Walker Parabola',
				untappd: createMockUntappdProduct({
					untappd_id: '4694797',
					untappd_name: 'Parabola (2022)',
				}),
			}),
			createMockVinmonopoletProduct({
				vmp_id: '2',
				vmp_name: 'Lervig Rackhouse Night By The Lake',
				untappd: createMockUntappdProduct({
					untappd_id: '4609649',
					untappd_name: 'Night By the Lake By Rackhouse',
				}),
			}),
			createMockVinmonopoletProduct({
				vmp_id: '2',
				vmp_name: 'Cool Brewery Co. Cool Cider',
				untappd: createMockUntappdProduct({
					untappd_id: '4609649',
					untappd_name: 'Cool Cider',
				}),
			}),
		];
		const didNotFindUntappdProduct = [
			createMockVinmonopoletProduct({
				vmp_id: '3',
				vmp_name: 'Super x Funky BA Imperial Double Sour Fruited NEIPA',
			}),
			createMockVinmonopoletProduct({
				vmp_id: '4',
				vmp_name: 'Skrutledalen Mikrobryggeri Skrutlejuice',
			}),
			createMockVinmonopoletProduct({
				vmp_id: '4',
				vmp_name: 'North x Garage // Weird formattted name',
			}),
		];

		didNotFindUntappdProduct.forEach((x) => {
			productsStatCollector.incrementSavedProducts();
			productsStatCollector.addDidNotFindUntappdProduct(x);
		});
		foundNewUntappdProduct.forEach((x) => {
			productsStatCollector.incrementSavedProducts();
			productsStatCollector.addFoundUntappdProduct(x);
		});

		productsStatCollector.printStatistics();
	});
});
