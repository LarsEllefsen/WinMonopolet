// jest.config.js
const { pathsToModuleNameMapper } = require('ts-jest');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('../tsconfig');

module.exports = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '.',
	testEnvironment: 'node',
	testRegex: '.integration-spec.ts$',
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest',
	},
	setupFilesAfterEnv: [
		'<rootDir>/testSetup.ts',
		'<rootDir>/initIntegrationTestEnvironment.ts',
	],
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/../',
	}),
	testTimeout: 70000,
};
