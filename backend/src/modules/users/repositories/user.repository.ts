import { CONNECTION_POOL } from '@modules/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { User } from '../entities/user.entity';

export type UserRow = {
	id: string;
	user_name: string;
	user_avatar: string;
	user_avatar_hd: string;
	first_name: string;
	access_token: string;
	salt: string;
	created: string;
	updated: string;
};

@Injectable()
export class UserRepository {
	constructor(@Inject(CONNECTION_POOL) private connectionPool: Pool) {}

	public async getAllUsers(): Promise<User[]> {
		const users = await this.connectionPool.query<UserRow>(
			'SELECT * FROM users',
		);

		return Promise.all(users.rows.map(this.mapRowToUser));
	}

	public async getUser(userId: string): Promise<User | null> {
		const user = await this.connectionPool.query<UserRow>(
			'SELECT * FROM users WHERE id = $1',
			[userId],
		);

		if (user.rowCount === 0) return null;

		return this.mapRowToUser(user.rows[0]);
	}

	public async saveUser(user: User) {
		const encryptedUser = await user.encryptAccessToken();

		await this.connectionPool.query(
			`
		INSERT INTO users 
			(id, user_name, user_avatar, user_avatar_hd, first_name, access_token, salt) 
		VALUES 
			($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT(id) DO UPDATE SET
			user_name = EXCLUDED.user_name,
			user_avatar = EXCLUDED.user_avatar,
			user_avatar_hd = EXCLUDED.user_avatar_hd,
			first_name = EXCLUDED.first_name,
			access_token = EXCLUDED.access_token,
			salt = EXCLUDED.salt`,
			[
				encryptedUser.id,
				encryptedUser.userName,
				encryptedUser.userAvatar,
				encryptedUser.userAvatarHD,
				encryptedUser.firstName,
				encryptedUser.accessToken,
				encryptedUser.salt.toString('base64'),
			],
		);
	}

	public async updateUser(user: User) {
		const encryptedUser = await user.encryptAccessToken();

		await this.connectionPool.query(
			`
		UPDATE users 
		SET
			user_name = $1,
			user_avatar = $2,
			user_avatar_hd = $3,
			first_name = $4,
			access_token = $5,
			salt = $6
		WHERE
			id = $7
			`,
			[
				encryptedUser.userName,
				encryptedUser.userAvatar,
				encryptedUser.userAvatarHD,
				encryptedUser.firstName,
				encryptedUser.accessToken,
				encryptedUser.salt.toString('base64'),
				encryptedUser.id,
			],
		);
	}

	public async deleteUser(userId: string) {
		await this.connectionPool.query('DELETE FROM users WHERE id = $1', [
			userId,
		]);
	}

	private async mapRowToUser(row: UserRow) {
		const user = new User(
			row.id,
			row.user_name,
			row.user_avatar,
			row.user_avatar_hd,
			row.first_name,
			row.access_token,
			Buffer.from(row.salt, 'base64'),
			new Date(row.created),
			new Date(row.updated),
		);

		return user.decryptAccessToken();
	}
}
