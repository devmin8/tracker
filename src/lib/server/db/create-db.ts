import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

export function createDb(databaseUrl: string) {
	const client = createClient({ url: databaseUrl });
	return drizzle({ client });
}
