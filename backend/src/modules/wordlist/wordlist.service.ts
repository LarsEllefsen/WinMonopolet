import { Injectable } from '@nestjs/common';
import { WordlistRepository } from '@modules/wordlist/repositories/wordlist.repository';

@Injectable()
export class WordlistService {
	constructor(private wordlistRepository: WordlistRepository) {}

	async deleteWord(id: number) {
		return this.wordlistRepository.deleteWordById(id);
	}

	async getAllWords() {
		return this.wordlistRepository.getAllWords();
	}

	async addWord(wordToAdd: string) {
		this.wordlistRepository.saveWord(wordToAdd);
	}
}
