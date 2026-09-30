import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { migrate } from 'drizzle-orm/libsql/migrator';

import type { Database } from '$lib/server/db/create-db';

const SQLITE_SIDECAR_SUFFIXES = ['', '-wal', '-shm', '-journal'];

export async function migrateDatabase(db: Database) {
	const migrationsFolder = join(process.cwd(), 'drizzle');
	if (!existsSync(migrationsFolder)) {
		throw new Error(`Migrations folder not found at ${migrationsFolder}`);
	}

	await migrate(db, { migrationsFolder });
}

export function resolveDatabaseFile(databaseUrl: string) {
	if (!databaseUrl.startsWith('file:')) {
		throw new Error(`Only file: database URLs are supported, got ${databaseUrl}`);
	}

	const path = databaseUrl.startsWith('file://')
		? fileURLToPath(databaseUrl)
		: databaseUrl.slice('file:'.length);

	return resolve(path);
}

export async function deleteDatabaseFile(databaseUrl: string) {
	const file = resolveDatabaseFile(databaseUrl);
	await Promise.all(
		SQLITE_SIDECAR_SUFFIXES.map((suffix) => rm(`${file}${suffix}`, { force: true }))
	);

	return file;
}
