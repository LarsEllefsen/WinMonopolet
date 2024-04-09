import { Inject, Injectable } from '@nestjs/common';
import { CONNECTION_POOL } from '../../database/database.module';
import { Pool } from 'pg';
import { Word } from '@modules/wordlist/entities/word';

type WordRow = {
	id: number;
	value: string;
};

@Injectable()
export class WordlistRepository {
	constructor(@Inject(CONNECTION_POOL) private connectionPool: Pool) {}

	public async getAllWords() {
		const words = await this.connectionPool.query<WordRow>(
			'SELECT * FROM wordlist',
		);
		return words.rows.map(this.mapRowToWord);
	}

	public async saveWord(word: string) {
		await this.connectionPool.query(
			'INSERT INTO wordlist (value) VALUES ($1)',
			[word],
		);
	}

	public async deleteWordById(id: number) {
		await this.connectionPool.query('DELETE FROM wordlist WHERE id = $1', [id]);
	}

	private mapRowToWord(row: WordRow) {
		return new Word(row.id, row.value);
	}
}
