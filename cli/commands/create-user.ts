import { createUser } from '$cli/services/users';
import type { Command, CommandDefinition } from '$cli/utils/command';
import { loadCliEnv } from '$cli/utils/env';
import { promptForPassword } from '$cli/utils/prompt';
import { UserInput, userOptions } from '$cli/utils/user-input';
import { createDb } from '$lib/server/db/create-db';

const createUserDefinition = {
	name: 'create-user',
	title: 'Create user',
	description: 'Create a user. The password is prompted for without echoing it.',
	arguments: [],
	options: userOptions
} satisfies CommandDefinition;

export const createUserCommand = {
	definition: createUserDefinition,
	schema: UserInput,
	async execute({ email, name }) {
		const env = loadCliEnv();
		const password = await promptForPassword();

		await createUser(createDb(env.DATABASE_URL), env, { email, name, password });
		console.log(`Created user: ${email}`);
	}
} satisfies Command<typeof UserInput>;
