import { mapToUntappdProduct } from '@modules/untappd/mapper';
import { Beer } from 'untappd-node';

describe('productMapper', () => {
	it('should map untappd dto to UntappdProduct', () => {
		const vmp_id = '12345678';
		const mockUntappdProductDTO = {
			name: 'Winmonopolet Barrel Aged Imperial Stout',
			brewery: 'Lars Brewing',
			abv: 16.5,
			id: '1234',
			style: 'Stout - Imperial / Double',
			numRatings: 69,
			rating: 4.55,
			image: 'https://picture.com/beer.png',
			url: 'https://untappd.com/b/lars-brewing-winmonopolet-barrel-aged-imperial-stout/1234',
		} satisfies Beer;

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
