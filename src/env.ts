import { defineEnvVars } from '@sveltejs/kit/env';

import { EnvSchema } from '$lib/server/env.schema';

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'SQLite DB Url',
		schema: EnvSchema.entries.DATABASE_URL
	},
	BETTER_AUTH_SECRET: {
		description: 'Better Auth secret used to encrypt cookies and hashes',
		schema: EnvSchema.entries.BETTER_AUTH_SECRET
	},
	BETTER_AUTH_URL: {
		description: 'Better Auth base URL',
		schema: EnvSchema.entries.BETTER_AUTH_URL
	}
});
