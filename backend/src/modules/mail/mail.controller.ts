import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Post,
	UseInterceptors,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { SendErrorReportDTO } from './dto/sendErrorReportDTO';

@Controller('mail')
@UseInterceptors(ClassSerializerInterceptor)
export class MailController {
	constructor(private readonly mailService: MailService) {}

	@Post('/error_report')
	async sendErrorReport(@Body() sendErrorReportDTO: SendErrorReportDTO) {
		await this.mailService.sendErrorReport(
			sendErrorReportDTO.product_name,
			sendErrorReportDTO.product_id,
			sendErrorReportDTO.error_type,
			sendErrorReportDTO.correct_untappd_url,
			sendErrorReportDTO.message,
		);
	}
}
