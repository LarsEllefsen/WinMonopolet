import { Module, OnModuleInit } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { ProductsModule } from '@modules/products/products.module';
import { DatabaseModule } from '@modules/database/database.module';
import { StoresRepository } from './repositories/stores.repository';
import { VinmonopoletModule } from '@modules/vinmonopolet/vinmonopolet.module';

@Module({
	imports: [DatabaseModule, ProductsModule, VinmonopoletModule],
	controllers: [StoresController],
	providers: [StoresService, StoresRepository],
	exports: [StoresService, StoresRepository],
})
export class StoresModule {}
