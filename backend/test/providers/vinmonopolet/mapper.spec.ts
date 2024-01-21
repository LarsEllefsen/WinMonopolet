import { mapToVinmonopoletProduct } from '@modules/vinmonopolet/mapper';
import { createMockVinmonopoletProductDTO } from 'test/utils/mockData';

describe('productMapper', () => {
	it('should map vinmonopolet baseProduct DTO to VinmonopoletProduct', () => {
		const vinmonopoletProductDTO = createMockVinmonopoletProductDTO({
			code: '231093',
			name: 'Nøgne Ø Imperial Stout',
			mainCategory: { name: 'Øl' },
			mainCountry: { name: 'Norge' },
			mainSubCategory: { name: 'Porter & Stout' },
			price: 69.9,
			productSelection: 'Basisutvalget',
			productType: 'Øl',
			url: 'www.vinmonopolet.no/test/url',
			volume: { formattedValue: '33cl', unit: 'cl', value: 33 },
		});

		const vinmonopoletProduct = mapToVinmonopoletProduct(
			vinmonopoletProductDTO,
		);

		expect(vinmonopoletProduct.active).toBe(1);
		expect(vinmonopoletProduct.added_date).toBeUndefined();
		expect(vinmonopoletProduct.category).toBe('Øl');
		expect(vinmonopoletProduct.container_size).toBe('33cl');
		expect(vinmonopoletProduct.country).toBe('Norge');
		expect(vinmonopoletProduct.last_updated).toBeUndefined();
		expect(vinmonopoletProduct.price).toBe(69.9);
		expect(vinmonopoletProduct.product_selection).toBe('Basisutvalget');
		expect(vinmonopoletProduct.sub_category).toBe('Porter & Stout');
		expect(vinmonopoletProduct.untappd).toBeUndefined();
		expect(vinmonopoletProduct.vmp_id).toBe('231093');
		expect(vinmonopoletProduct.vmp_name).toBe('Nøgne Ø Imperial Stout');
		expect(vinmonopoletProduct.vmp_url).toBe('www.vinmonopolet.no/test/url');
	});
});
