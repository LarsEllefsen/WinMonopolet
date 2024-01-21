import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('stores')
export class Store {
	@PrimaryColumn()
	@IsNotEmpty()
	@IsString()
	store_id: string;

	@Column()
	@IsNotEmpty()
	@IsString()
	name: string;

	@Column()
	@IsNotEmpty()
	@IsString()
	formatted_name: string;

	@Column()
	@IsNotEmpty()
	@IsNumber()
	category: number;

	@Column()
	@IsNotEmpty()
	@IsString()
	address: string;

	@Column()
	@IsNotEmpty()
	@IsString()
	city: string;

	@Column()
	@IsNotEmpty()
	@IsString()
	zip: string;

	@Column()
	@IsNotEmpty()
	@IsString()
	lon: string;

	@Column()
	@IsNotEmpty()
	@IsString()
	lat: string;
}
