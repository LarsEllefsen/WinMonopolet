import { Module } from '@nestjs/common';
import { VinmonopoletService } from './vinmonopolet.service';

@Module({
	imports: [],
	providers: [VinmonopoletService],
	exports: [VinmonopoletService],
})
export class VinmonopoletModule {}
