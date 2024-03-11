import {
	Controller,
	Get,
	Post,
	Body,
	Query,
	Param,
	Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateUntappdProductFromIdDTO } from './dto/createUntappdProductFromIdDTO';
import { ParseOptionalBoolPipe } from '@common/pipes/parseOptionalBool.pipe';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { VinmonopoletProduct } from './entities/vinmonopoletProduct.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get()
	@ApiResponse({
		status: 200,
		description: 'The found products',
		type: VinmonopoletProduct,
		isArray: true,
	})
	async getProducts(
		@Query('query') query?: string,
		@Query('hasUntappdProduct', ParseOptionalBoolPipe)
		hasUntappdProduct?: boolean,
		@Query('active', ParseOptionalBoolPipe) active?: boolean,
	) {
		return this.productsService.getProducts(query, hasUntappdProduct, active);
	}

	@Post(':vmp_id/untappd')
	createUntappdProductFromId(
		@Param('vmp_id') vmp_id: string,
		@Body() createUntappdProductFromIdDTO: CreateUntappdProductFromIdDTO,
	) {
		return this.productsService.createUntappdProductForVinmonopoletProduct(
			vmp_id,
			createUntappdProductFromIdDTO.untappd_id,
		);
	}

	@Delete(':vmp_id/untappd')
	deleteUntappdProductFromId(@Param('vmp_id') vmp_id: string) {
		return this.productsService.deleteUntappdProduct(vmp_id);
	}
}
