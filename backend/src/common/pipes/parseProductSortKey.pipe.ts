import { ProductSortKey } from '@common/types/QueryParameters';
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseProductSortKey implements PipeTransform {
	transform(value?: string) {
		if (!value) {
			return undefined;
		}
		if (Object.values(ProductSortKey).includes(value)) {
			return ProductSortKey[value as keyof typeof ProductSortKey];
		}
		throw new BadRequestException(`Invalid product sort key ${value}`);
	}
}
