import { Module, OnModuleInit } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UntappdProduct } from './entities/untappdProduct.entity';
import { VinmonopoletProduct } from './entities/vinmonopoletProduct.entity';
import { VinmonopoletModule } from '@modules/vinmonopolet/vinmonopolet.module';
import { UntappdModule } from '@modules/untappd/untappd.module';
import { WordlistModule } from '@modules/wordlist/wordlist.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([VinmonopoletProduct]),
		TypeOrmModule.forFeature([UntappdProduct]),
		UntappdModule,
		VinmonopoletModule,
		WordlistModule,
	],
	controllers: [ProductsController],
	providers: [ProductsService],
	exports: [ProductsService],
})
export class ProductsModule implements OnModuleInit {
	constructor(private readonly service: ProductsService) {}
	async onModuleInit() {
		// await this.service.asd();
	}
}
