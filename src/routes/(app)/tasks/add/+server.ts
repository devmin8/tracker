import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { CreateTaskSchema } from '$lib/schemas/create-task.schema';
import { db } from '$lib/server/db';
import { badRequest, protectedApi, readJson, validationError } from '$lib/server/http';
import { createTask } from '$lib/server/tasks';

export const POST = protectedApi(async ({ request }, user) => {
	const body = await readJson(request);
	if (!body.ok) {
		return badRequest('Please check the task details');
	}

	const parsed = v.safeParse(CreateTaskSchema, body.result);
	if (!parsed.success) {
		return validationError(parsed.issues, 'Please check the task details');
	}

	const result = await createTask(db, user.id, parsed.output);
	if (!result.ok) {
		return badRequest(result.message);
	}

	return json({ id: result.id });
});
