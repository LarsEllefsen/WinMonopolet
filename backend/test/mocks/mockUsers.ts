import { UntappdUser } from '@modules/untappd/entities/UntappdUser.entity';
import { User } from '@modules/users/entities/user.entity';
import { randomBytes } from 'crypto';

const SALT = randomBytes(16);

export const mockUser1 = new User(
	'user_1',
	'TheTestMan',
	'https://test-url.com',
	'https://test-url-hd.com',
	'Jan',
	'ACCESS_TOKEN_1',
	SALT,
	undefined,
	undefined,
);

export const mockUser2 = new User(
	'user_2',
	'TheMockBro',
	'https://user-avatar.test.com',
	'https://user-avatar-hd.test.com',
	'Trine',
	'ACCESS_TOKEN_2',
	SALT,
	undefined,
	undefined,
);

export const mockUntappdUser1 = new UntappdUser(
	'user_1',
	'TheTestMan',
	'https://test-url.com',
	'https://test-url-hd.com',
	'Jan',
);

export const mockUntappdUser2 = new UntappdUser(
	'user_2',
	'TheMockBro',
	'https://user-avatar.test.com',
	'https://user-avatar-hd.test.com',
	'Trine',
);

export const mockUsers = [mockUser1, mockUser2];
export const mockUntappdUsers = [mockUntappdUser1, mockUntappdUser2];
