import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ParseOptionalBoolPipe implements PipeTransform {
	transform(value?: string) {
		if (value === undefined) return value;
		return value === 'true';
	}
}
