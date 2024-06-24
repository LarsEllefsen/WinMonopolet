import { ProductsService } from '@modules/products/products.service';
import { UsersService } from '@modules/users/users.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import { JobStatus, Queue } from 'bull';

@Injectable()
export class AdminService {
	constructor(
		private readonly usersService: UsersService,
		private readonly productsService: ProductsService,
		@InjectQueue('user') private userQueue: Queue,
	) {}

	getAllUsers() {
		return this.usersService.getAllUsers();
	}

	async getUserById(userId: string) {
		const user = await this.usersService.getUser(userId);
		if (!user) {
			throw new NotFoundException(`No user with id ${userId} found.`);
		}

		return user;
	}

	async getUsersInQueueWithStatus(status: JobStatus) {
		const jobs = await this.getAllJobsWithStatus(status);
		return jobs;
	}

	async findAndSaveAnyUpcomingProducts() {
		return this.productsService.findAndSaveAnyUpcomingProducts();
	}

	private getAllJobsWithStatus(status: JobStatus) {
		switch (status) {
			case 'active':
				return this.userQueue.getActive();
			case 'delayed':
				return this.userQueue.getDelayed();
			case 'failed':
				return this.userQueue.getFailed();
			case 'completed':
				return this.userQueue.getCompleted();
			case 'waiting':
				return this.userQueue.getWaiting();
			default:
				return Promise.resolve([]);
		}
	}
}
