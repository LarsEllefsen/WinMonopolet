import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Store } from '@modules/stores/entities/stores.entity';

@Entity('user_favorited_stores')
export class FavoriteStore {
	@PrimaryColumn({ name: 'user_id', type: 'text' })
	userId: string;

	@ManyToOne(() => User)
	@JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
	user: User;

	@PrimaryColumn({ name: 'store_id' })
	store_id: string;

	@ManyToOne(() => Store, (store) => store.store_id)
	@JoinColumn({ referencedColumnName: 'store_id', name: 'store_id' })
	store: Store;
}
