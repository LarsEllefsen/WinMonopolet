import { Module, OnModuleInit } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UntappdModule } from '@modules/untappd/untappd.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserContextProvider } from './providers/userContext.provider';
import { BullModule } from '@nestjs/bull';
import { UserQueueConsumer } from './providers/userQueue.consumer';
import { UserProduct } from './entities/userProduct.entity';
import {
	FIVE_MINUTES_IN_MILLISECONDS,
	ONE_HOUR_IN_MILLISECONDS,
} from '@common/constants';
import { StoresModule } from '@modules/stores/stores.module';
import { FavoriteStore } from './entities/favoriteStore.entity';
import { UserWishlistProduct } from './entities/userWishlistProduct.entity';
import { UserNotification } from './entities/userNotification.entity';

@Module({
	imports: [
		JwtModule,
		ConfigModule,
		UntappdModule,
		StoresModule,
		TypeOrmModule.forFeature([
			User,
			UserProduct,
			FavoriteStore,
			UserWishlistProduct,
			UserNotification,
		]),
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
	providers: [UsersService, UserContextProvider, UserQueueConsumer],
	exports: [UsersService],
})
export class UsersModule {
	constructor(private readonly service: UsersService) {}
}
