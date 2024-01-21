import { IsNotEmpty } from 'class-validator';

export class AddFavoriteStoreDTO {
	@IsNotEmpty()
	storeId: string;
}
