import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
} from '@nestjs/common';
import { WordlistService } from './wordlist.service';
import { CreateWordDTO } from './dto/createWordDTO';

@Controller('wordlist')
export class WordlistController {
	constructor(private wordlistService: WordlistService) {}

	@Get()
	getWordlist() {
		return this.wordlistService.getAllWords();
	}

	@Post()
	addNewWord(@Body() wordToAdd: CreateWordDTO) {
		return this.wordlistService.addWord(wordToAdd.word);
	}

	@Delete(':id')
	deleteWord(@Param('id') id: number) {
		return this.wordlistService.deleteWord(id);
	}
}
