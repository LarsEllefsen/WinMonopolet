import {
	ClassSerializerInterceptor,
	Controller,
	Get,
	Param,
	Query,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ParseJobStatus } from '@common/pipes/parseJobStatus.pipe';
import { JobStatus } from 'bull';
import { AdminGuard } from '@common/guards/admin.guard';
import { mapJobToQueueJobDTO } from './mapper';

@Controller('admin')
@UseGuards(AdminGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Get('/users')
	getAllUsers() {
		return this.adminService.getAllUsers();
	}

	@Get('/users/:user_id')
	async getUser(@Param('user_id') userId: string) {
		return this.adminService.getUserById(userId);
	}

	@Get('/queue/user')
	async getUsersInQueue(@Query('status', ParseJobStatus) status: JobStatus) {
		return (await this.adminService.getUsersInQueueWithStatus(status)).map(
			mapJobToQueueJobDTO,
		);
	}
}
