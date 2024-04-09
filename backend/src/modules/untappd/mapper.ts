import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { UntappdProductDTO } from './dto/UntappdProductDTO';
import { UntappdUserDTO } from './dto/UntappdUserDTO';
import { GetUserProductResponseDTO } from './dto/GetUserProductResponseDTO';
import { UserProduct } from '@modules/users/entities/userProduct.entity';
import { UntappdUserProductDTO } from './dto/UntappdUserProductDTO';
import { GetUserWishlistProductResponseDTO } from './dto/GetUserWishlistProductsResponseDTO';
import { UntappdUserWishlistProductDTO } from './dto/UntappdUserWishlistProductDTO';
import { UserWishlistProduct } from '@modules/users/entities/userWishlistProduct.entity';
import { UntappdUser } from './entities/UntappdUser.entity';

export const mapToUntappdProduct = (beer: UntappdProductDTO, vmpId: string) => {
	return new UntappdProduct(
		beer.bid.toString(),
		vmpId,
		beer.beer_name,
		beer.beer_abv,
		beer.rating_score,
		beer.rating_count,
		`https://untappd.com/b/${beer.beer_slug}/${beer.bid}`,
		beer.beer_label,
		beer.beer_style,
		beer.brewery.brewery_name,
		undefined,
	);
};

export const mapToUntappdUser = (userDTO: UntappdUserDTO) => {
	return new UntappdUser(
		userDTO.id.toString(),
		userDTO.user_name,
		userDTO.user_avatar,
		userDTO.user_avatar_hd,
		userDTO.first_name,
	);
};

const mapToUserProducts = (
	untappdUserProductDTO: UntappdUserProductDTO,
	userId: string,
): UserProduct => {
	return new UserProduct(
		untappdUserProductDTO.beer.bid.toString(),
		userId,
		untappdUserProductDTO.user_auth_rating_score,
	);
};

const mapToUserWishlistProducts = (
	untappdUserProductDTO: UntappdUserWishlistProductDTO,
	userId: string,
): UserWishlistProduct => {
	return new UserWishlistProduct(
		untappdUserProductDTO.beer.bid.toString(),
		userId,
	);
};

export const mapToUserProductsWithPagination = (
	{ beers, total_count, pagination }: GetUserProductResponseDTO,
	userId: string,
) => {
	return {
		totalCount: total_count,
		nextOffset: pagination.offset,
		products: beers.items.map((product) => mapToUserProducts(product, userId)),
	};
};

export const mapToUserWishlistProductsWithTotalCount = (
	{ beers, total_count }: GetUserWishlistProductResponseDTO,
	userId: string,
) => {
	return {
		totalCount: total_count,
		products: beers.items.map((product) =>
			mapToUserWishlistProducts(product, userId),
		),
	};
};
