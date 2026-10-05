import { deleteDatabaseFile, migrateDatabase } from '$cli/services/database';
import { createUser } from '$cli/services/users';
import type { Command, CommandDefinition } from '$cli/utils/command';
import { loadCliEnv } from '$cli/utils/env';
import { promptForPassword } from '$cli/utils/prompt';
import { UserInput, userOptions } from '$cli/utils/user-input';
import { createDb } from '$lib/server/db/create-db';

const resetDbDefinition = {
	name: 'reset-db',
	title: 'Reset database',
	description:
		'Delete the database file, re-run migrations and create a user. The password is prompted for without echoing it.',
	arguments: [],
	options: userOptions
} satisfies CommandDefinition;

export const resetDbCommand = {
	definition: resetDbDefinition,
	schema: UserInput,
	async execute({ email, name }) {
		if (process.env.NODE_ENV === 'production') {
			throw new Error('reset-db is disabled when NODE_ENV=production');
		}

		const env = loadCliEnv();
		// Prompt first so cancelling does not leave the database deleted.
		const password = await promptForPassword();

		const file = await deleteDatabaseFile(env.DATABASE_URL);
		console.log(`Deleted ${file}`);

		const db = createDb(env.DATABASE_URL);
		await migrateDatabase(db);
		console.log('Migrations applied');

		await createUser(db, env, { email, name, password });
		console.log(`Created user: ${email}`);
	}
} satisfies Command<typeof UserInput>;
