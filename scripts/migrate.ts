import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { migrate } from 'drizzle-orm/libsql/migrator';

import { createDb } from '$lib/server/db/create-db';
import { getEnvData } from '$lib/server/env.schema';

const { DATABASE_URL } = getEnvData();
const db = createDb(DATABASE_URL);

async function main() {
	const migrationsFolder = join(process.cwd(), 'drizzle');
	if (!existsSync(migrationsFolder)) {
		console.error(`Error: migrations folder not found at ${migrationsFolder}`);
		process.exit(1);
	}

	await migrate(db, { migrationsFolder });
	console.log('Migrations applied');
}

main();
