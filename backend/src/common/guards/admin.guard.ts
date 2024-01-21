import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

type AdminToken = {
	userId: string;
};

@Injectable()
export class AdminGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	private readonly logger = new Logger(AdminGuard.name);

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest() as Request;
		const token = this.extractTokenFromHeader(request);
		if (!token) {
			return false;
		}

		try {
			const { userId } = await this.jwtService.verifyAsync<AdminToken>(token, {
				secret: this.configService.getOrThrow('JWT_SECRET'),
			});

			if (
				!userId ||
				userId !== this.configService.getOrThrow('ADMIN_USER_ID')
			) {
				throw new UnauthorizedException('Invalid or missing userId');
			}
		} catch (error) {
			this.logger.error(`Failed to authorize admin user`, error?.stack);
			return false;
		}

		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
