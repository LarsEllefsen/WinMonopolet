import { FactoryProvider, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

export class UserContext {
	constructor(accessToken: string, userId?: string) {
		this.accessToken = accessToken;
		this.userId = userId;
	}

	accessToken: string;
	userId?: string;

	getAccessToken() {
		return this.accessToken;
	}
}

export const UserContextProvider: FactoryProvider<() => UserContext> = {
	provide: 'USERCONTEXT',
	useFactory: (req: Request) => () => {
		const accessToken = req.headers.authorization as string;
		const userId = req.headers['x-user-id'] as string;
		return new UserContext(accessToken, userId);
	},
	scope: Scope.REQUEST,
	inject: [REQUEST],
};
