import { defineEnvVars } from '@sveltejs/kit/env';

import { EnvSchema } from '$lib/server/env.schema';

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'SQLite DB Url',
		schema: EnvSchema.entries.DATABASE_URL
	}
});
