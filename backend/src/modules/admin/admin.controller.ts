import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ParseJobStatus } from '@common/pipes/parseJobStatus.pipe';
import { JobStatus } from 'bull';
import { AdminGuard } from '@common/guards/admin.guard';
import { mapJobToQueueJobDTO } from './mapper';
import { CreateBannerDTO } from './dto/CreateBannerDTO';

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

	@Post('/scheduler/find-and-save-any-upcoming-products')
	@HttpCode(204)
	triggerFindAndSaveAnyUpcomingProducts() {
		this.adminService.findAndSaveAnyUpcomingProducts();
	}

	@Post('/banner')
	@HttpCode(204)
	async createBanner(@Body() createBannerDTO: CreateBannerDTO) {
		await this.adminService.createBanner(
			createBannerDTO.text,
			createBannerDTO.color,
		);
	}

	@Delete('/banner')
	@HttpCode(204)
	async deleteBanner() {
		await this.adminService.deleteBanner();
	}

	@Put('/banner')
	@HttpCode(200)
	updateBanner(@Body() createBannerDTO: CreateBannerDTO) {
		return this.adminService.updateBanner(
			createBannerDTO.text,
			createBannerDTO.color,
		);
	}
}
