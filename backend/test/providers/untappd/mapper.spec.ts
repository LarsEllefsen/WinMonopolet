import { mapToUntappdProduct } from '@modules/untappd/mapper';
import {
	createMockUntappdProductDTO,
	createMockVinmonopoletProduct,
} from 'test/utils/mockData';

describe('productMapper', () => {
	it('should map untappd dto to UntappdProduct', () => {
		const vmp_id = '12345678';
		const mockUntappdProductDTO = createMockUntappdProductDTO({
			beer_name: 'Winmonopolet Barrel Aged Imperial Stout',
			brewery_name: 'Lars Brewing',
			beer_abv: 16.5,
			bid: 1234,
			beer_style: 'Stout - Imperial / Double',
			rating_count: 69,
			rating_score: 4.55,
			beer_slug: 'lars-brewing-winmonopolet-barrel-aged-imperial-stout',
			beer_label: 'https://picture.com/beer.png',
		});

		const untappProduct = mapToUntappdProduct(mockUntappdProductDTO, vmp_id);

		expect(untappProduct.abv).toBe(16.5);
		expect(untappProduct.untappd_name).toBe(
			'Winmonopolet Barrel Aged Imperial Stout',
		);
		expect(untappProduct.brewery).toBe('Lars Brewing');
		expect(untappProduct.num_ratings).toBe(69);
		expect(untappProduct.rating).toBe(4.55);
		expect(untappProduct.untappd_id).toBe('1234');
		expect(untappProduct.style).toBe('Stout - Imperial / Double');
		expect(untappProduct.vmp_id).toBe(vmp_id);
		expect(untappProduct.untappd_url).toBe(
			'https://untappd.com/b/lars-brewing-winmonopolet-barrel-aged-imperial-stout/1234',
		);
		expect(untappProduct.picture_url).toBe('https://picture.com/beer.png');
	});
});
