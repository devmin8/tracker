import * as v from 'valibot';

import type { CommandOption } from '$cli/utils/command';

export const userOptions = [
	{
		key: 'email',
		name: '--email <email>',
		flag: 'email',
		description: 'User email',
		required: true
	},
	{
		key: 'name',
		name: '--name <name>',
		flag: 'name',
		description: 'User display name',
		required: true
	}
] satisfies CommandOption[];

export const UserInput = v.object({
	email: v.pipe(
		v.string('An email is required'),
		v.trim(),
		v.toLowerCase(),
		v.nonEmpty('An email is required')
	),
	name: v.pipe(v.string('A name is required'), v.trim(), v.nonEmpty('A name is required'))
});
