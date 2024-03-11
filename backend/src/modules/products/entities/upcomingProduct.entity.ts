import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { VinmonopoletProduct } from './vinmonopoletProduct.entity';
import { IsDateString } from 'class-validator';

@Entity('upcoming_products')
export class UpcomingProduct {
	@PrimaryColumn({ name: 'vmp_id', type: 'text' })
	@OneToOne(
		() => VinmonopoletProduct,
		(vinmonopoletProduct) => vinmonopoletProduct.vmp_id,
	)
	@JoinColumn({ name: 'vmp_id' })
	vinmonopoletProduct: VinmonopoletProduct;

	@Column({ nullable: false, type: 'date', name: 'release_date' })
	@IsDateString()
	releaseDate: Date;
}
