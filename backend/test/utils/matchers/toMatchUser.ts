import { User } from '@modules/users/entities/user.entity';
import type { MatcherFunction, ExpectationResult } from 'expect';

const toMatchUser: MatcherFunction<[expectedUser: unknown]> = (
	actualUser,
	expectedUser,
) => {
	if (!(actualUser instanceof User)) {
		throw new TypeError(
			`Actual product must be instances of User. Recieved ${typeof actualUser}`,
		);
	}
	if (!(expectedUser instanceof User)) {
		throw new TypeError(
			`Expected product must be instances of User. Recieved ${typeof expectedUser}`,
		);
	}

	const { passed, validationErrorMessages } = compareUsers(
		actualUser,
		expectedUser,
	);

	if (passed) {
		return {
			message: () => `Jippi!`,
			pass: true,
		} satisfies ExpectationResult;
	} else {
		return {
			message: () => validationErrorMessages.join('\n'),
			pass: false,
		} satisfies ExpectationResult;
	}
};

const compareUsers = (
	actual: Record<string, unknown>,
	expected: Record<string, unknown>,
) => {
	const validationErrorMessages: string[] = [];
	for (const [key, value] of Object.entries(expected)) {
		if (key === 'created' || key === 'updated' || key === 'salt') continue;
		if (actual[key] !== value)
			validationErrorMessages.push(
				`Expected ${key} to be ${value}. Recieved ${actual[key]}`,
			);
	}

	const actualSalt = actual.salt as Buffer;
	const expectedSalt = expected.salt as Buffer;
	if (actualSalt.toString('base64') !== expectedSalt.toString('base64')) {
		validationErrorMessages.push(
			`Expected salt to be ${expectedSalt.toString(
				'base64',
			)}. Recieved  ${actualSalt.toString('base64')}`,
		);
	}

	return {
		passed: validationErrorMessages.length === 0,
		validationErrorMessages,
	};
};

export default toMatchUser;
