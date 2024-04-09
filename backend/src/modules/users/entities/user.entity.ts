import { deepCopyClass } from '@utils/deepCopyClass';
import { createCipheriv, createDecipheriv, scrypt } from 'crypto';
import { promisify } from 'util';

export class User {
	constructor(
		id: string,
		userName: string,
		userAvatar: string,
		userAvatarHD: string,
		firstName: string | undefined,
		accessToken: string,
		salt: Buffer,
		created?: Date,
		updated?: Date,
	) {
		this.id = id;
		this.userName = userName;
		this.userAvatar = userAvatar;
		this.userAvatarHD = userAvatarHD;
		this.firstName = firstName;
		this.accessToken = accessToken;
		this.salt = salt;
		this.created = created;
		this.updated = updated;
	}

	[key: string]: any;

	id: string;

	userName: string;

	userAvatar: string;

	userAvatarHD: string;

	firstName?: string;

	accessToken: string;

	salt: Buffer;

	created?: Date;

	updated?: Date;

	async encryptAccessToken() {
		const encryptedUser = deepCopyClass(this);

		if (
			encryptedUser.accessToken === undefined ||
			encryptedUser.salt === undefined
		)
			throw new Error(
				'Salt and access token must be set in order to save user',
			);

		const key = (await promisify(scrypt)(
			process.env.ACCESS_TOKEN_ENCRYPTION_KEY as string,
			encryptedUser.salt,
			32,
		)) as Buffer;
		const cipher = createCipheriv('aes-256-ctr', key, encryptedUser.salt);
		const encryptedAccessToken = Buffer.concat([
			cipher.update(encryptedUser.accessToken),
			cipher.final(),
		]).toString('base64');

		encryptedUser.accessToken = encryptedAccessToken;

		return encryptedUser;
	}

	async decryptAccessToken() {
		const decryptedUser = deepCopyClass(this);

		const key = (await promisify(scrypt)(
			process.env.ACCESS_TOKEN_ENCRYPTION_KEY as string,
			decryptedUser.salt as Buffer,
			32,
		)) as Buffer;

		const decipher = createDecipheriv(
			'aes-256-ctr',
			key,
			decryptedUser.salt as Buffer,
		);
		const decryptedAccessToken =
			decipher.update(
				Buffer.from(decryptedUser.accessToken as string, 'base64'),
			) + decipher.final('utf-8');

		decryptedUser.accessToken = decryptedAccessToken;

		return decryptedUser;
	}
}
