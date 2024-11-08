import { mapToVinmonopoletProduct } from '@modules/vinmonopolet/mapper';
import { createMockVinmonopoletProductDTO } from 'test/utils/createMockData';

describe('productMapper', () => {
	it('should map vinmonopolet baseProduct DTO to VinmonopoletProduct', () => {
		const vinmonopoletProductDTO = createMockVinmonopoletProductDTO({
			code: '231093',
			name: 'Nøgne Ø Imperial Stout',
			mainCategory: { name: 'Øl', code: 'Øl', url: '' },
			mainCountry: { name: 'Norge', code: 'Norge', url: '' },
			mainSubCategory: {
				name: 'Porter & Stout',
				code: 'Porter & Stout',
				url: '',
			},
			price: 69.9,
			productSelection: 'Basisutvalget',
			url: 'www.vinmonopolet.no/test/url',
			volume: { formattedValue: '33cl', unit: 'cl', value: 33 },
		});

		const vinmonopoletProduct = mapToVinmonopoletProduct(
			vinmonopoletProductDTO,
		);

		expect(vinmonopoletProduct.active).toBe(true);
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
