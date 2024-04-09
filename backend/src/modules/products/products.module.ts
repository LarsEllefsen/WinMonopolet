import { DatabaseModule } from '@modules/database/database.module';
import { UntappdModule } from '@modules/untappd/untappd.module';
import { VinmonopoletModule } from '@modules/vinmonopolet/vinmonopolet.module';
import { WordlistModule } from '@modules/wordlist/wordlist.module';
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { UpcomingProductRepository } from './repositories/upcomingProduct.repository';

@Module({
	imports: [UntappdModule, VinmonopoletModule, WordlistModule, DatabaseModule],
	controllers: [ProductsController],
	providers: [ProductsService, ProductsRepository, UpcomingProductRepository],
	exports: [ProductsService],
})
export class ProductsModule {}
