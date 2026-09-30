import * as v from 'valibot';

import { createDb } from '$lib/server/db/create-db';
import { createUser } from '$cli/services/users';
import { Command, command, type CommandDefinition } from '$cli/utils/command';
import { loadCliEnv } from '$cli/utils/env';
import { promptForPassword } from '$cli/utils/prompt';
import { UserInput, userOptions } from '$cli/utils/user-input';

const createUserDefinition = {
	name: 'create-user',
	title: 'Create user',
	description: 'Create a user. The password is prompted for without echoing it.',
	arguments: [],
	options: userOptions
} satisfies CommandDefinition;

@command(createUserDefinition)
export class CreateUserCommand extends Command<typeof UserInput> {
	readonly schema = UserInput;

	protected async execute({ email, name }: v.InferOutput<typeof UserInput>) {
		const env = loadCliEnv();
		const password = await promptForPassword();

		await createUser(createDb(env.DATABASE_URL), env, { email, name, password });
		console.log(`Created user: ${email}`);
	}
}
