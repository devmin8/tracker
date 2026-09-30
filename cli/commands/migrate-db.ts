import * as v from 'valibot';

import { createDb } from '$lib/server/db/create-db';
import { migrateDatabase } from '$cli/services/database';
import { Command, command, type CommandDefinition } from '$cli/utils/command';
import { loadCliEnv } from '$cli/utils/env';

const migrateDbDefinition = {
	name: 'migrate-db',
	title: 'Migrate database',
	description: 'Apply generated migrations to the database.',
	arguments: [],
	options: []
} satisfies CommandDefinition;

const MigrateDbInput = v.object({});

@command(migrateDbDefinition)
export class MigrateDbCommand extends Command<typeof MigrateDbInput> {
	readonly schema = MigrateDbInput;

	protected async execute() {
		const { DATABASE_URL } = loadCliEnv();

		await migrateDatabase(createDb(DATABASE_URL));
		console.log('Migrations applied');
	}
}
