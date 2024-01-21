import {
	AfterLoad,
	BeforeInsert,
	BeforeUpdate,
	Column,
	CreateDateColumn,
	Entity,
	OneToOne,
	PrimaryColumn,
} from 'typeorm';
import { UntappdProduct } from './untappdProduct.entity';
import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TWO_WEEKS_IN_MILLISECONDS } from '@common/constants';

@Entity('vinmonopolet_products')
export class VinmonopoletProduct {
	@ApiProperty({ description: 'The unique product ID', example: '14962702' })
	@PrimaryColumn({ name: 'vmp_id' })
	vmp_id: string;

	@Column()
	vmp_name: string;

	@Column()
	vmp_url: string;

	@Column({ type: 'float' })
	price: number;

	@Column()
	category: string;

	@Column({ type: 'text', nullable: true })
	sub_category: string | null;

	@Column()
	product_selection: string;

	@Column()
	container_size: string;

	@Column()
	country: string;

	@CreateDateColumn()
	@IsDateString()
	added_date?: Date;

	@Column({ nullable: false, type: 'timestamptz' })
	last_updated?: Date;

	@Column()
	active: number;

	is_new: boolean;

	@OneToOne(
		() => UntappdProduct,
		(untappdProduct) => untappdProduct.vinmonopolet_product,
		{ cascade: ['insert', 'update', 'remove'], eager: true },
	)
	untappd?: UntappdProduct | null;

	withUntappdProduct(untappdProduct: UntappdProduct) {
		this.untappd = untappdProduct;
		return this;
	}

	@BeforeInsert()
	@BeforeUpdate()
	setUpdated() {
		this.active = 1;
		this.last_updated = new Date();
	}

	@AfterLoad()
	setIsNew() {
		const today = new Date();
		const added = this.added_date as Date;
		if (today.getTime() - added.getTime() <= TWO_WEEKS_IN_MILLISECONDS) {
			this.is_new = true;
		} else {
			this.is_new = false;
		}
	}
}
