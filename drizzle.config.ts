import { defineConfig } from 'drizzle-kit';

import { loadEnvFileIfExists } from './src/lib/server/load-env';

loadEnvFileIfExists();

// drizzle-kit runs outside SvelteKit, so it cannot use $app/env/private.
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	out: './drizzle',
	schema: './src/lib/server/db/schema/index.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.DATABASE_URL
	}
});
