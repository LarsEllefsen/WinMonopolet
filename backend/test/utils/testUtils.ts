import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { User } from '@modules/users/entities/user.entity';
import { UserProduct } from '@modules/users/entities/userProduct.entity';
import { UserWishlistProduct } from '@modules/users/entities/userWishlistProduct.entity';

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

export const usersShouldMatch = (a: User[], b: User[]) => {
	expect(a).toHaveLength(b.length);
	a.forEach((product) =>
		expect(product).toMatchUser(b.find((x) => x.id === product.id) ?? null),
	);
};

export const userProductsShouldMatch = (a: UserProduct[], b: UserProduct[]) => {
	a.forEach((wishlistProduct) => {
		const expectedWishlistProduct = b.find(
			(x) =>
				x.userId === wishlistProduct.userId &&
				x.untappdId === wishlistProduct.untappdId,
		);
		expect(wishlistProduct.userId).toEqual(expectedWishlistProduct?.userId);
		expect(wishlistProduct.untappdId).toEqual(
			expectedWishlistProduct?.untappdId,
		);
	});
};

export const userWishlistProductsShouldMatch = (
	a: UserWishlistProduct[],
	b: UserWishlistProduct[],
) => {
	a.forEach((wishlistProduct) => {
		const expectedWishlistProduct = b.find(
			(x) =>
				x.userId === wishlistProduct.userId &&
				x.untappdId === wishlistProduct.untappdId,
		);
		expect(wishlistProduct.userId).toEqual(expectedWishlistProduct?.userId);
		expect(wishlistProduct.untappdId).toEqual(
			expectedWishlistProduct?.untappdId,
		);
		expect(wishlistProduct.added).toBeWithinSecondsOfDate(new Date(), 10);
	});
};
