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

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	private readonly logger = new Logger(AuthGuard.name);

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest() as Request;
		const token = this.extractTokenFromHeader(request);
		if (!token) {
			return false;
		}

		try {
			const { accessToken, userId } = await this.jwtService.verifyAsync(token, {
				secret: this.configService.getOrThrow('JWT_SECRET'),
			});

			if (!accessToken) {
				throw new UnauthorizedException('Invalid or missing accessToken');
			}

			request.headers.authorization = accessToken;
			request.headers['x-user-id'] = userId;
		} catch (error) {
			this.logger.error('Failed to authorize user', error?.stack);
			return false;
		}

		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
