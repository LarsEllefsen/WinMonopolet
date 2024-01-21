import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { UntappdProductDTO } from './dto/UntappdProductDTO';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { User } from '@modules/users/entities/user.entity';
import { UntappdUserDTO } from './dto/UntappdUserDTO';
import { GetUserProductResponseDTO } from './dto/GetUserProductResponseDTO';
import { UserProduct } from '@modules/users/entities/userProduct.entity';
import { UntappdUserProductDTO } from './dto/UntappdUserProductDTO';
import { GetUserWishlistProductResponseDTO } from './dto/GetUserWishlistProductsResponseDTO';
import { UntappdUserWishlistProductDTO } from './dto/UntappdUserWishlistProductDTO';
import { UserWishlistProduct } from '@modules/users/entities/userWishlistProduct.entity';

export const mapToUntappdProduct = (beer: UntappdProductDTO, vmpId: string) => {
	const untappdProduct = new UntappdProduct();
	untappdProduct.untappd_id = beer.bid.toString();
	untappdProduct.vmp_id = vmpId;
	untappdProduct.untappd_name = beer.beer_name;
	untappdProduct.untappd_url = `https://untappd.com/b/${beer.beer_slug}/${beer.bid}`;
	untappdProduct.rating = beer.rating_score;
	untappdProduct.num_ratings = beer.rating_count;
	untappdProduct.picture_url = beer.beer_label;
	untappdProduct.abv = beer.beer_abv;
	untappdProduct.brewery = beer.brewery.brewery_name;
	untappdProduct.style = beer.beer_style;

	return untappdProduct;
};

export const mapToUser = (userDTO: UntappdUserDTO) => {
	const user = new User();

	user.id = userDTO.id.toString();
	user.userName = userDTO.user_name;
	user.userAvatar = userDTO.user_avatar;
	user.userAvatarHD = userDTO.user_avatar_hd;
	user.firstName = userDTO.first_name;

	return user;
};

const mapToUserProducts = (
	untappdUserProductDTO: UntappdUserProductDTO,
	userId: string,
): UserProduct => {
	const userProduct = new UserProduct();
	userProduct.untappdId = untappdUserProductDTO.beer.bid.toString();
	userProduct.userScore = untappdUserProductDTO.user_auth_rating_score;
	userProduct.userId = userId;

	return userProduct;
};

const mapToUserWishlistProducts = (
	untappdUserProductDTO: UntappdUserWishlistProductDTO,
	userId: string,
): UserWishlistProduct => {
	const userWishlistProduct = new UserWishlistProduct();
	userWishlistProduct.untappdId = untappdUserProductDTO.beer.bid.toString();
	userWishlistProduct.userId = userId;

	return userWishlistProduct;
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
