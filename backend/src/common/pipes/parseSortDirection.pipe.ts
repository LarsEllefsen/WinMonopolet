import { SortDirection } from '@common/types/QueryParameters';
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseSortDirection implements PipeTransform {
	transform(value?: string) {
		if (!value) {
			return undefined;
		}
		if (Object.values(SortDirection).includes(value)) {
			return SortDirection[value as keyof typeof SortDirection];
		}
		throw new BadRequestException(`Invalid sort direction ${value}`);
	}
}
