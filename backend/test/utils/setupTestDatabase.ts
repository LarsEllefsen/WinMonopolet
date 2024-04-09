import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';

export default async function setupTestDatabase() {
	const postgresContainer = await new PostgreSqlContainer(
		'postgres:latest',
	).start();

	execSync(
		`dbmate -u ${postgresContainer.getConnectionUri()}?sslmode=disable up`,
	);

	return postgresContainer;
}
