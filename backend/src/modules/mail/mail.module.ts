import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [ConfigModule],
	controllers: [MailController],
	providers: [MailService],
	exports: [],
})
export class MailModule {}
