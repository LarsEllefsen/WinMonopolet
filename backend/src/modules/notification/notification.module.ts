import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import {
	ONE_HOUR_IN_MILLISECONDS,
	THIRTY_SECONDS_IN_MILLISECONDS,
} from '@common/constants';

import { NotificationService } from './notification.provider';
import { UsersModule } from '@modules/users/users.module';
import { MailModule } from '@modules/mail/mail.module';

@Module({
	imports: [
		UsersModule,
		MailModule,
		BullModule.registerQueue({
			name: 'notification',
			defaultJobOptions: {
				attempts: 3,
				backoff: { type: 'fixed', delay: ONE_HOUR_IN_MILLISECONDS },
				timeout: THIRTY_SECONDS_IN_MILLISECONDS,
				removeOnComplete: false,
			},
		}),
	],
	controllers: [],
	providers: [NotificationService],
	exports: [NotificationService],
})
export class NotificationModule {}
