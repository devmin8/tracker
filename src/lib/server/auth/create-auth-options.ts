import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';

import type { createDb } from '$lib/server/db/create-db';
import * as schema from '$lib/server/db/schema';

type CreateAuthOptions = {
	autoSignIn?: boolean;
	baseURL: string;
	db: ReturnType<typeof createDb>;
	disableSignUp: boolean;
	secret: string;
};

export function createAuthOptions({
	autoSignIn,
	baseURL,
	db,
	disableSignUp,
	secret
}: CreateAuthOptions) {
	return {
		baseURL,
		secret,
		emailAndPassword: {
			enabled: true,
			disableSignUp,
			minPasswordLength: 8,
			maxPasswordLength: 90,
			...(autoSignIn === undefined ? {} : { autoSignIn })
		},
		database: drizzleAdapter(db, {
			provider: 'sqlite',
			schema
		})
	};
}
