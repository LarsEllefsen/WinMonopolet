import { Job } from 'bull';
import { QueueJobDTO } from './dto/QueueJobDTO';

export const mapJobToQueueJobDTO = (job: Job) => {
	return new QueueJobDTO(
		job.id.toString(),
		job.data,
		job.attemptsMade,
		job.timestamp,
		job.failedReason,
		job.finishedOn,
	);
};
