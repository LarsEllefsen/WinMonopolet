import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { VinmonopoletService } from './vinmonopolet.service';
import { Facet } from 'vinmonopolet-ts';
import { writeFile, writeFileSync } from 'fs';

@Module({
	imports: [],
	providers: [VinmonopoletService],
	exports: [VinmonopoletService],
})
export class VinmonopoletModule implements OnModuleInit {
	constructor(private vinmonopoletService: VinmonopoletService) {}

	async onModuleInit() {
		// const data = await this.vinmonopoletService.getAllProductsByStore(
		// 	'143',
		// 	Facet.Category.BEER,
		// );
		// writeFileSync('./test.json', JSON.stringify(data));
	}
}
