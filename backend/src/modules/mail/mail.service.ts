import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
import Mailgun, { MailgunMessageData } from 'mailgun.js';

@Injectable()
export class MailService {
	constructor(private readonly configService: ConfigService) {}

	private domain = 'winmonopolet.com';
	private from = 'Winmonopolet <mail@winmonopolet.com>';

	private mailgun = new Mailgun(FormData).client({
		username: 'api',
		key: this.configService.getOrThrow('MAILGUN_API_KEY'),
		url: 'https://api.eu.mailgun.net',
	});

	async sendErrorReport(
		productName: string,
		productId: string,
		errorType: string,
		correctUntappdUrl: string | null,
		message: string,
	) {
		const data: MailgunMessageData = {
			from: this.from,
			to: 'mail@winmonopolet.com',
			subject: `[Error report] ${productName} [${productId}]: ${errorType}`,
			text: this.getErrorReportText(message, correctUntappdUrl),
		};

		await this.mailgun.messages.create(this.domain, data);
	}

	private getErrorReportText(
		userMessage: string,
		correctUntappdUrl: string | null,
	) {
		let errorReportText =
			correctUntappdUrl !== null
				? `Riktig untappd produkt: ${correctUntappdUrl} \n\n`
				: '';
		errorReportText += `Feilbeskrivelse: ${userMessage}`;

		return errorReportText;
	}
}
