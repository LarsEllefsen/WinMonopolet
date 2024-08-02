import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BullModule } from '@nestjs/bull';
import {
	FIVE_MINUTES_IN_MILLISECONDS,
	ONE_HOUR_IN_MILLISECONDS,
} from '@common/constants';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from '@modules/products/products.module';
import { CacheModule } from '@nestjs/cache-manager';
import { BannerModule } from '@modules/banner/banner.module';

@Module({
	imports: [
		JwtModule,
		ConfigModule,
		ProductsModule,
		BullModule.registerQueue({
			name: 'user',
			defaultJobOptions: {
				attempts: 10,
				backoff: { type: 'fixed', delay: ONE_HOUR_IN_MILLISECONDS },
				timeout: FIVE_MINUTES_IN_MILLISECONDS,
				removeOnComplete: true,
			},
		}),
		CacheModule.register(),
		BannerModule,
	],
	controllers: [AdminController],
	providers: [AdminService],
	exports: [],
})
export class AdminModule {}
