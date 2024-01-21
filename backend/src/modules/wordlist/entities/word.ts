import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('wordlist')
export class Word {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	value: string;
}
