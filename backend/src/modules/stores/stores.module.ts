import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from './entities/stock.entity';
import { StoresController } from './stores.controller';
import { Store } from './entities/stores.entity';
import { StoresService } from './stores.service';
import { VinmonopoletModule } from '@modules/vinmonopolet/vinmonopolet.module';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { ProductsModule } from '@modules/products/products.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Store]),
		TypeOrmModule.forFeature([Stock]),
		TypeOrmModule.forFeature([VinmonopoletProduct]),
		VinmonopoletModule,
		ProductsModule,
	],
	controllers: [StoresController],
	providers: [StoresService],
	exports: [StoresService],
})
export class StoresModule {
	constructor(private service: StoresService) {}
}
