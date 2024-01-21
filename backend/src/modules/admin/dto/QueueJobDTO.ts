export class QueueJobDTO {
	id: string;
	data: any;
	attemptsMade: number;
	failedReason?: string;
	finishedOn?: number;
	timestamp: number;

	constructor(
		id: string,
		data: any,
		attemptsMade: number,
		timeStamp: number,
		failedReason?: string,
		finishedOn?: number,
	) {
		this.id = id;
		this.data = data;
		this.attemptsMade = attemptsMade;
		this.timestamp = timeStamp;
		this.failedReason = failedReason;
		this.finishedOn = finishedOn;
	}
}
