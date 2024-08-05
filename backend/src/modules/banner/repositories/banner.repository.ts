import { CONNECTION_POOL } from '@modules/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Banner, BannerColor } from '../entities/banner.entity';

@Injectable()
export class BannerRepository {
	constructor(@Inject(CONNECTION_POOL) private connectionPool: Pool) {}

	async createBanner(text: string, color: string) {
		await this.connectionPool.query('INSERT INTO banner VALUES ($1, $2)', [
			text,
			color,
		]);
	}

	async getBanner(): Promise<Banner | null> {
		const { rows, rowCount } = await this.connectionPool.query<Banner>(
			'SELECT * FROM banner',
		);

		if (rowCount == 0) {
			return null;
		}

		return rows[0];
	}

	async updateBanner(text: string, color: BannerColor): Promise<Banner> {
		const { rows } = await this.connectionPool.query<Banner>(
			'UPDATE banner SET text = $1, color = $2 RETURNING *',
			[text, color],
		);

		return rows[0];
	}

	async deleteBanner() {
		await this.connectionPool.query('DELETE FROM banner');
	}
}
