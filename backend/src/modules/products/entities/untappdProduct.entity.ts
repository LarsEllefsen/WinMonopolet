import {
	BeforeInsert,
	Column,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';
import { VinmonopoletProduct } from './vinmonopoletProduct.entity';
import { IsDateString } from 'class-validator';
import { Exclude } from 'class-transformer';

@Entity('untappd_products')
export class UntappdProduct {
	@Column({ nullable: false })
	untappd_id: string;

	@PrimaryColumn({ name: 'vmp_id' })
	vmp_id: string;

	@OneToOne(() => VinmonopoletProduct)
	@JoinColumn({ name: 'vmp_id', referencedColumnName: 'vmp_id' })
	vinmonopolet_product: VinmonopoletProduct;

	@Column({ nullable: false })
	untappd_name: string;

	@Column({ type: 'decimal', nullable: false })
	abv: number;

	@Column({ type: 'decimal', nullable: false })
	rating: number;

	@Column({ nullable: false })
	num_ratings: number;

	@Column({ nullable: false })
	untappd_url: string;

	@Column({ nullable: false })
	picture_url: string;

	@Column({ nullable: false })
	style: string;

	@Column({ nullable: false })
	brewery: string;

	@Column({ nullable: false })
	@IsDateString()
	last_updated?: Date;

	@BeforeInsert()
	@BeforeInsert()
	private setUpdated() {
		this.last_updated = new Date();
	}
}
