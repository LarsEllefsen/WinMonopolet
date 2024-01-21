import { HttpException, HttpStatus } from '@nestjs/common';

export class APILimitReachedException extends HttpException {
	constructor() {
		super('API limit reached', HttpStatus.TOO_MANY_REQUESTS);
	}
}
