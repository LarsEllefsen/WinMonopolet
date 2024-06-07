import { Module } from '@nestjs/common';
import { StoresModule } from '@modules/stores/stores.module';
import { ProductsModule } from '@modules/products/products.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { UntappdModule } from '@modules/untappd/untappd.module';
import { VinmonopoletModule } from '@modules/vinmonopolet/vinmonopolet.module';
import { WordlistModule } from '@modules/wordlist/wordlist.module';
import { SchedulerService } from '@modules/scheduler/scheduler.service';
import { UsersModule } from '@modules/users/users.module';
import { BullModule } from '@nestjs/bull';
import { MailModule } from '@modules/mail/mail.module';
import { AdminModule } from '@modules/admin/admin.module';
import { DatabaseModule } from '@modules/database/database.module';
import { ReleasesModule } from '@modules/releases/releases.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
	imports: [
		ConfigModule.forRoot(),
		ScheduleModule.forRoot(),
		BullModule.forRoot({
			redis: {
				host: 'localhost',
				port: 6379,
			},
		}),
		CacheModule.register({ isGlobal: true }),
		DatabaseModule,
		StoresModule,
		ProductsModule,
		UntappdModule,
		VinmonopoletModule,
		WordlistModule,
		UsersModule,
		MailModule,
		AdminModule,
		ReleasesModule,
	],
	providers: [SchedulerService],
})
export class AppModule {}
