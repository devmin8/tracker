import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// used by drizzle-kit CLI only (db:push, db:generate, db:studio) and it runs outside SvelteKit,
// so that's why using process.env not the $app/env/private.
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	out: './drizzle',
	schema: './src/lib/server/db/schemas/index.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.DATABASE_URL
	}
});
