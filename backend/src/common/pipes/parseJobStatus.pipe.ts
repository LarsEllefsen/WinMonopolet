import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { JobStatus, Queue } from 'bull';

@Injectable()
export class ParseJobStatus implements PipeTransform {
	transform(value?: string) {
		if (!value) {
			throw new BadRequestException(`query param status is required`);
		}
		if (isJobStatus(value)) {
			return value as JobStatus;
		}
		throw new BadRequestException(`Invalid job status ${value}`);
	}
}

function isJobStatus(value?: string): value is JobStatus {
	return (
		value === 'completed' ||
		value === 'waiting' ||
		value === 'active' ||
		value === 'delayed' ||
		value === 'failed' ||
		value === 'paused'
	);
}
