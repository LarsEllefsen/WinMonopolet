// See https://kit.svelte.dev/docs/types#app

import type { SessionToken } from '$lib/server/session/sessionToken';
import type { User } from './types/user';
import 'unplugin-icons/types/svelte';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: {
				user?: User;
				token?: SessionToken;
			};

			errorDuringLogin?: boolean;
		}
		interface PageData {
			user: User;
			stores: Store[];
			isAuthenticated: boolean;
		}
		// interface Platform {}
	}
}

export {};
