import { UserProduct } from '@modules/users/entities/userProduct.entity';
import { mockUser1, mockUser2 } from './mockUsers';
import { UserWishlistProduct } from '@modules/users/entities/userWishlistProduct.entity';

export const mockUserProduct1 = new UserProduct(
	mockUser1.id,
	'test_untappd_product_1',
	4.0,
);
export const mockUserProduct2 = new UserProduct(
	mockUser1.id,
	'test_untappd_product_2',
	3.0,
);

export const mockUserWishlistProduct1 = new UserWishlistProduct(
	mockUser1.id,
	'test_untappd_product',
	undefined,
);

export const mockUserWishlistProduct2 = new UserWishlistProduct(
	mockUser2.id,
	'test_untappd_product_2',
	undefined,
);

export const mockUserWishlistProduct3 = new UserWishlistProduct(
	mockUser1.id,
	'test_untappd_product_3',
	undefined,
);

export const mockUserProducts = [mockUserProduct1, mockUserProduct2];
export const mockUserWishlistProducts = [
	mockUserWishlistProduct1,
	mockUserWishlistProduct2,
	mockUserWishlistProduct3,
];
