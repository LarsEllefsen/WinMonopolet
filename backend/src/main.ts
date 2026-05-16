import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogLevel, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const logLevels = ['log', 'warn', 'error', 'debug'] satisfies LogLevel[];
	const debugLogging =
		process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug'
			? (['debug'] satisfies LogLevel[])
			: [];

	const app = await NestFactory.create(AppModule, {
		logger: [...logLevels, ...debugLogging],
	});

	app.setGlobalPrefix('api');
	app.useGlobalPipes(new ValidationPipe());

	await app.listen(3000);
}
bootstrap();
