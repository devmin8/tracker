import * as v from 'valibot';

import { createDb } from '$lib/server/db/create-db';
import { migrateDatabase } from '$cli/services/database';
import type { Command, CommandDefinition } from '$cli/utils/command';
import { loadCliEnv } from '$cli/utils/env';

const migrateDbDefinition = {
	name: 'migrate-db',
	title: 'Migrate database',
	description: 'Apply generated migrations to the database.',
	arguments: [],
	options: []
} satisfies CommandDefinition;

const MigrateDbInput = v.object({});

export const migrateDbCommand = {
	definition: migrateDbDefinition,
	schema: MigrateDbInput,
	async execute() {
		const { DATABASE_URL } = loadCliEnv();

		await migrateDatabase(createDb(DATABASE_URL));
		console.log('Migrations applied');
	}
} satisfies Command<typeof MigrateDbInput>;
