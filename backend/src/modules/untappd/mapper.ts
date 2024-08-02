import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { UntappdUserDTO } from './dto/UntappdUserDTO';
import { UntappdUser } from './entities/UntappdUser.entity';
import { Beer } from 'untappd-node';

export const mapToUntappdProduct = (beer: Beer, vmpId: string) => {
	return new UntappdProduct(
		beer.id,
		vmpId,
		beer.name,
		beer.abv ?? 0,
		beer.rating,
		beer.numRatings,
		beer.url,
		beer.image,
		beer.style,
		beer.brewery,
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
