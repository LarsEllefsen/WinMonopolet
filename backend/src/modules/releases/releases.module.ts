import { DatabaseModule } from '@modules/database/database.module';
import { Module } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { ReleasesController } from './releases.controller';
import { UpcomingProductRepository } from '@modules/products/repositories/upcomingProduct.repository';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
	imports: [DatabaseModule],
	controllers: [ReleasesController],
	providers: [ReleasesService, UpcomingProductRepository],
	exports: [ReleasesService],
})
export class ReleasesModule {}
