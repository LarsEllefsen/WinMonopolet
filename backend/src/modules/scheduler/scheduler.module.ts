import { Global, Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { ProductsModule } from '@modules/products/products.module';
import { StoresModule } from '@modules/stores/stores.module';

@Global()
@Module({
	imports: [ProductsModule, StoresModule],
	providers: [SchedulerService],
})
export class ScheduleModule {}
