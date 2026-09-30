import { betterAuth } from 'better-auth/minimal';

import { createAuthOptions } from '$lib/server/auth/create-auth-options';
import type { Database } from '$lib/server/db/create-db';
import type { EnvData } from '$lib/server/env.schema';

type NewUser = {
	email: string;
	name: string;
	password: string;
};

export async function createUser(
	db: Database,
	env: Pick<EnvData, 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL'>,
	user: NewUser
) {
	// This instance exists only for provisioning. The application Auth instance still has sign-up disabled.
	const provisioningAuth = betterAuth({
		...createAuthOptions({
			db,
			baseURL: env.BETTER_AUTH_URL,
			secret: env.BETTER_AUTH_SECRET,
			disableSignUp: false,
			autoSignIn: false
		})
	});

	await provisioningAuth.api.signUpEmail({ body: user });
}
