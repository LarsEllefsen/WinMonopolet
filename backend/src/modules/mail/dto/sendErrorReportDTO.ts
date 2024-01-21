import { IsNotEmpty } from 'class-validator';

export class SendErrorReportDTO {
	@IsNotEmpty()
	product_name: string;

	@IsNotEmpty()
	product_id: string;

	@IsNotEmpty()
	error_type: string;

	correct_untappd_url: string | null;

	message: string;
}
