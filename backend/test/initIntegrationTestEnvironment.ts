import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import setupTestDatabase from './utils/setupTestDatabase';
import { Client } from 'pg';
import 'jest-date';

export let postgresContainer: StartedPostgreSqlContainer;
export let postgresClient: Client;

beforeAll(async () => {
	postgresContainer = await setupTestDatabase();

	process.env.DB_PORT = postgresContainer.getPort().toString();
	process.env.DB_PASSWORD = postgresContainer.getPassword();
	process.env.DB_USER = postgresContainer.getUsername();
	process.env.DB_NAME = postgresContainer.getDatabase();

	postgresClient = new Client({
		connectionString: postgresContainer.getConnectionUri(),
	});
	await postgresClient.connect();
});

afterAll(async () => {
	await postgresClient.end();
	await postgresContainer.stop();
});
