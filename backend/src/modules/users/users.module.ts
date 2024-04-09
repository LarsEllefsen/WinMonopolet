import {
	FIVE_MINUTES_IN_MILLISECONDS,
	ONE_HOUR_IN_MILLISECONDS,
} from '@common/constants';
import { DatabaseModule } from '@modules/database/database.module';
import { StoresModule } from '@modules/stores/stores.module';
import { UntappdModule } from '@modules/untappd/untappd.module';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserContextProvider } from './providers/userContext.provider';
import { UserQueueConsumer } from './providers/userQueue.consumer';
import { FavoriteStoreRepository } from './repositories/favoriteStore.repository';
import { UserRepository } from './repositories/user.repository';
import { UserNotificationRepository } from './repositories/userNotification.repository';
import { UserProductsRepository } from './repositories/userProducts.repository';
import { UserWishlistRepository } from './repositories/userWishlist.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
@Module({
	imports: [
		DatabaseModule,
		JwtModule,
		ConfigModule,
		UntappdModule,
		StoresModule,
		BullModule.registerQueue({
			name: 'user',
			defaultJobOptions: {
				attempts: 10,
				backoff: { type: 'fixed', delay: ONE_HOUR_IN_MILLISECONDS },
				timeout: FIVE_MINUTES_IN_MILLISECONDS,
				removeOnComplete: true,
			},
		}),
	],
	controllers: [UsersController],
	providers: [
		UsersService,
		UserContextProvider,
		UserQueueConsumer,
		UserRepository,
		FavoriteStoreRepository,
		UserProductsRepository,
		UserWishlistRepository,
		UserNotificationRepository,
	],
	exports: [UsersService],
})
export class UsersModule {
	constructor(private readonly service: UsersService) {}
}
