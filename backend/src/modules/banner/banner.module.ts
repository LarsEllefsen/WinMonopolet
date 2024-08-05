import { DatabaseModule } from '@modules/database/database.module';
import { BannerService } from './banner.service';
import { BannerRepository } from './repositories/banner.repository';
import { Module } from '@nestjs/common';
import { BannerController } from './banner.controller';

@Module({
	imports: [DatabaseModule],
	controllers: [BannerController],
	providers: [BannerRepository, BannerService],
	exports: [BannerService],
})
export class BannerModule {}
