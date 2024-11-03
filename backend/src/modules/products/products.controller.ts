import {
	Controller,
	Get,
	Post,
	Body,
	Query,
	Param,
	Delete,
	ParseArrayPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateUntappdProductFromIdDTO } from './dto/createUntappdProductFromIdDTO';
import { ParseOptionalBoolPipe } from '@common/pipes/parseOptionalBool.pipe';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { VinmonopoletProduct } from './entities/vinmonopoletProduct.entity';
import { ProductSortKey, SortDirection } from '@common/types/QueryParameters';
import { ParseProductSortKey } from '@common/pipes/parseProductSortKey.pipe';
import { ParseSortDirection } from '@common/pipes/parseSortDirection.pipe';

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
		@Query(
			'productCategory',
			new ParseArrayPipe({ items: String, optional: true }),
		)
		categories?: string[],
		@Query(
			'productSubCategory',
			new ParseArrayPipe({ items: String, optional: true }),
		)
		subCategories?: string[],
		@Query('limit') limit?: number,
		@Query('offset') offset?: number,
		@Query('sortBy', ParseProductSortKey)
		sortBy?: ProductSortKey,
		@Query('sort', ParseSortDirection) sort?: SortDirection,
	) {
		return this.productsService.getProducts(
			query,
			hasUntappdProduct,
			active,
			categories,
			subCategories,
			limit,
			offset,
			sortBy,
			sort,
		);
	}

	@Get(':vmp_id')
	getVinmonopoletProduct(@Param('vmp_id') productId: string) {
		return this.productsService.getProduct(productId);
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
