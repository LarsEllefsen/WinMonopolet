import {
	CreateDateColumn,
	Entity,
	JoinColumn,
	PrimaryColumn,
	Unique,
} from 'typeorm';

@Entity('user_wishlist_products')
@Unique('id', ['userId', 'untappdId'])
export class UserWishlistProduct {
	@PrimaryColumn({ name: 'user_id', type: 'text' })
	@JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
	userId: string;

	@PrimaryColumn({ name: 'untappd_id' })
	untappdId: string;

	@CreateDateColumn()
	added: Date;
}
