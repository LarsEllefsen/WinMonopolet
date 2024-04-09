import { Module } from '@nestjs/common';
import { WordlistService } from './wordlist.service';
import { WordlistController } from './wordlist.controller';
import { WordlistRepository } from '@modules/wordlist/repositories/wordlist.repository';
import { DatabaseModule } from '@modules/database/database.module';

@Module({
	imports: [DatabaseModule],
	controllers: [WordlistController],
	providers: [WordlistService, WordlistRepository],
	exports: [WordlistService],
})
export class WordlistModule {}
