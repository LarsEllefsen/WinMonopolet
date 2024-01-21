import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '@modules/stores/entities/stores.entity';
import { StoresModule } from '@modules/stores/stores.module';
import { ProductsModule } from '@modules/products/products.module';
import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { Stock } from '@modules/stores/entities/stock.entity';
import {
	addUserAvatarHDColumn,
	createStockTable,
	createStoresTable,
	createUntappdProductsTable,
	createUserFavoritedStoresTable,
	createUserNotificationTable,
	createUserProductsTable,
	createUserTable,
	createUserWishlistProductsTable,
	createVinmonopoletProductsTable,
	createWordlistTable,
} from './database/migrations';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { UntappdModule } from '@modules/untappd/untappd.module';
import { VinmonopoletModule } from '@modules/vinmonopolet/vinmonopolet.module';
import { WordlistModule } from '@modules/wordlist/wordlist.module';
import { Word } from '@modules/wordlist/entities/word';
import { SchedulerService } from '@modules/scheduler/scheduler.service';
import { UsersModule } from '@modules/users/users.module';
import { User } from '@modules/users/entities/user.entity';
import { UserProduct } from '@modules/users/entities/userProduct.entity';
import { BullModule } from '@nestjs/bull';
import { FavoriteStore } from '@modules/users/entities/favoriteStore.entity';
import { UserWishlistProduct } from '@modules/users/entities/userWishlistProduct.entity';
import { UserNotification } from '@modules/users/entities/userNotification.entity';
import { MailModule } from '@modules/mail/mail.module';
import { AdminModule } from '@modules/admin/admin.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		ScheduleModule.forRoot(),
		TypeOrmModule.forRoot({
			type: 'postgres',
			database: 'winmonopolet',
			host: 'localhost',
			port: 5432,
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			entities: [
				Store,
				UntappdProduct,
				VinmonopoletProduct,
				Stock,
				Word,
				User,
				UserProduct,
				FavoriteStore,
				UserWishlistProduct,
				UserNotification,
			],
			synchronize: false,
			migrationsRun: true,
			migrations: [
				createStoresTable,
				createVinmonopoletProductsTable,
				createUntappdProductsTable,
				createStockTable,
				createWordlistTable,
				createUserTable,
				createUserProductsTable,
				createUserFavoritedStoresTable,
				addUserAvatarHDColumn,
				createUserWishlistProductsTable,
				createUserNotificationTable,
			],
		}),
		BullModule.forRoot({
			redis: {
				host: 'localhost',
				port: 6379,
			},
		}),
		StoresModule,
		ProductsModule,
		UntappdModule,
		VinmonopoletModule,
		WordlistModule,
		UsersModule,
		MailModule,
		AdminModule,
	],
	providers: [SchedulerService],
})
export class AppModule {}
