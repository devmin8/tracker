import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import { relations } from './schema';

export function createDb(databaseUrl: string) {
	const client = createClient({ url: databaseUrl });
	return drizzle({ client, relations });
}

export type Database = ReturnType<typeof createDb>;
