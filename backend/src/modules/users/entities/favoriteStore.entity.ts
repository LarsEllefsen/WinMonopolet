import { User } from './user.entity';
import { Store } from '@modules/stores/entities/stores.entity';

export class FavoriteStore {
	constructor(userId: string, storeId: string) {
		this.userId = userId;
		this.store_id = storeId;
	}

	userId: string;

	user: User;

	store_id: string;

	store: Store;
}
