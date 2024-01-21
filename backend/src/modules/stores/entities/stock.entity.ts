import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryColumn,
} from 'typeorm';
import { Store } from './stores.entity';

@Entity('stock')
export class Stock {
	@PrimaryColumn({ name: 'store_id' })
	@ManyToOne(() => Store, (store) => store.store_id)
	@JoinColumn({ name: 'store_id' })
	store: Store;

	@PrimaryColumn({ name: 'vmp_id' })
	@OneToOne(() => VinmonopoletProduct, (product) => product.vmp_id)
	@JoinColumn({ name: 'vmp_id' })
	product: VinmonopoletProduct;

	@Column()
	stock_level: number;

	@Column()
	last_updated: Date;

	toString() {
		return `
		{ 
			store: ${this.store.name} (${this.store.store_id}),
			product: ${this.product.vmp_name} (${this.product.vmp_id}),
			stock_level: ${this.stock_level}
		}`;
	}

	@BeforeInsert()
	@BeforeUpdate()
	private setLastUpdated() {
		this.last_updated = new Date();
	}
}
