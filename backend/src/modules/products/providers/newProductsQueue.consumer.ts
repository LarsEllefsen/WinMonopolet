import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { VinmonopoletProduct } from '../entities/vinmonopoletProduct.entity';

type NewProductJob = {
	storeId: string;
	product: VinmonopoletProduct;
};

@Processor('newProducts')
export class NewProductsQueueConsumer {
	@Process()
	async processNewProducts(job: Job<NewProductJob>) {
		// job.
	}
}
