import { HttpModule } from '@nestjs/axios';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UntappdService } from './untappd.service';
import { UntappdClient } from './untappdClient';

@Module({
	imports: [HttpModule, ConfigModule],
	providers: [UntappdService, UntappdClient],
	exports: [UntappdService],
})
export class UntappdModule implements OnModuleInit {
	constructor(private untappdService: UntappdService) {}

	async onModuleInit() {
		// this.untappdService.search('Mikkeller Blow Out')
	}
}
