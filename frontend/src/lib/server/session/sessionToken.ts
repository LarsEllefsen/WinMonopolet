import { env } from '$env/dynamic/private';
import jwt, { type JwtPayload } from 'jsonwebtoken';

type SessionTokenValues = {
	accessToken: string;
	userId?: string;
};

export class SessionToken {
	private accessToken: string;
	private userId?: string;

	private value: string;

	constructor(accessToken: string, userId?: string) {
		this.accessToken = accessToken;
		this.userId = userId;

		this.value = this.encode();
	}

	private encode() {
		return jwt.sign({ accessToken: this.accessToken, userId: this.userId }, env.JWT_SECRET);
	}

	public getAccessToken() {
		return this.accessToken;
	}

	public getUserId() {
		return this.userId;
	}

	public getValue() {
		return this.value;
	}

	toString() {
		return this.value;
	}

	static fromCookie(sessionTokenCookie: string) {
		const payload = jwt.verify(sessionTokenCookie, env.JWT_SECRET) as SessionTokenValues;

		if (!payload.accessToken) throw new Error('session token does not contain an access token');

		return new SessionToken(payload.accessToken, payload.userId);
	}
}

export const decodeSessionToken = (sessionToken: string) => {
	const payload = jwt.verify(sessionToken, env.JWT_SECRET) as JwtPayload;
	return payload.accessToken;
};
