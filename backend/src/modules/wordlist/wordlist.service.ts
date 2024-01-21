import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Word } from './entities/word';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WordlistService {
	constructor(
		@InjectRepository(Word)
		private wordlistRepository: Repository<Word>,
	) {}

	async deleteWord(id: number) {
		return this.wordlistRepository.delete({ id });
	}

	async getAllWords() {
		const words = await this.wordlistRepository.find();
		return words;
	}

	async addWord(wordToAdd: string) {
		const word = new Word();
		word.value = wordToAdd;
		this.wordlistRepository.save(word);
	}
}
