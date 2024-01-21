import {
	AfterInsert,
	AfterLoad,
	AfterUpdate,
	BeforeInsert,
	BeforeUpdate,
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';

import { createCipheriv, createDecipheriv, scrypt } from 'crypto';
import { promisify } from 'util';
import { Exclude } from 'class-transformer';
import { UserProduct } from './userProduct.entity';

@Entity('users')
export class User {
	@PrimaryColumn()
	id: string;

	@Column({ name: 'user_name' })
	userName: string;

	@Column({ name: 'user_avatar' })
	userAvatar: string;

	@Column({ name: 'user_avatar_hd' })
	userAvatarHD: string;

	@Column({ name: 'first_name' })
	firstName?: string;

	@Column({ name: 'access_token' })
	@Exclude()
	accessToken: string;

	@Column({
		type: 'text',
		transformer: {
			to(value: Buffer) {
				return value.toString('base64');
			},
			from(value: string) {
				return Buffer.from(value, 'base64');
			},
		},
	})
	@Exclude()
	salt: Buffer;

	@Column()
	@CreateDateColumn()
	created: Date;

	@Column({ default: 'CURRENT_TIMESTAMP' })
	updated: Date;

	@BeforeInsert()
	@BeforeUpdate()
	private async encryptAccessToken() {
		if (this.accessToken === undefined || this.salt === undefined)
			throw new Error(
				'Salt and access token must be set in order to save user',
			);
		const key = (await promisify(scrypt)(
			process.env.ACCESS_TOKEN_ENCRYPTION_KEY as string,
			this.salt,
			32,
		)) as Buffer;
		const cipher = createCipheriv('aes-256-ctr', key, this.salt);
		const encryptedAccessToken = Buffer.concat([
			cipher.update(this.accessToken),
			cipher.final(),
		]).toString('base64');
		this.accessToken = encryptedAccessToken;
	}

	@BeforeInsert()
	@BeforeUpdate()
	private setUpdated() {
		this.updated = new Date();
	}

	@AfterLoad()
	@AfterInsert()
	@AfterUpdate()
	private async decryptAccessToken() {
		const key = (await promisify(scrypt)(
			process.env.ACCESS_TOKEN_ENCRYPTION_KEY as string,
			this.salt as Buffer,
			32,
		)) as Buffer;

		const decipher = createDecipheriv('aes-256-ctr', key, this.salt as Buffer);
		const decryptedAccessToken =
			decipher.update(Buffer.from(this.accessToken as string, 'base64')) +
			decipher.final('utf-8');

		this.accessToken = decryptedAccessToken;
	}
}
