import { Inject, Module, OnModuleDestroy, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Pool } from 'pg';

export const CONNECTION_POOL = 'CONNECTION_POOL';

const databaseProvider: Provider<Pool> = {
	provide: CONNECTION_POOL,
	useFactory: () => {
		return new Pool({
			user: process.env.DB_USER,
			database: process.env.DB_NAME,
			host: 'localhost',
			port: Number(process.env.DB_PORT),
			password: process.env.DB_PASSWORD,
		});
	},
};

@Module({
	imports: [ConfigModule],
	providers: [databaseProvider],
	exports: [databaseProvider],
})
export class DatabaseModule implements OnModuleDestroy {
	constructor(@Inject(CONNECTION_POOL) private readonly pool: Pool) {}
	async onModuleDestroy() {
		await this.pool.end();
	}
}
