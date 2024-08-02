import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';

export const productsShouldMatch = (
	a: VinmonopoletProduct[],
	b: VinmonopoletProduct[],
	ignoreActiveState = false,
) => {
	expect(a).toHaveLength(b.length);
	a.forEach((product) =>
		expect(product).toMatchProduct(
			b.find((x) => x.vmp_id === product.vmp_id) ?? null,
			ignoreActiveState,
		),
	);
};
