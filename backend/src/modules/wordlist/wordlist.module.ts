import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordlistService } from './wordlist.service';
import { WordlistController } from './wordlist.controller';
import { Word } from './entities/word';

@Module({
	imports: [TypeOrmModule.forFeature([Word])],
	controllers: [WordlistController],
	providers: [WordlistService],
	exports: [WordlistService],
})
export class WordlistModule {}
