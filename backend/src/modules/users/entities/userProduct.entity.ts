import { Column, Entity, JoinColumn, PrimaryColumn } from 'typeorm';

@Entity('user_products')
export class UserProduct {
	@PrimaryColumn({ name: 'user_id', type: 'text' })
	@JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
	userId: string;

	@PrimaryColumn({ name: 'untappd_id' })
	untappdId: string;

	@Column({ name: 'user_score', type: 'decimal' })
	userScore: number;
}
