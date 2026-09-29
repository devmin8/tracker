import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { TaskIdSchema } from '$lib/schemas/task-id.schema';
import { UpdateTaskSchema } from '$lib/schemas/update-task.schema';
import { db } from '$lib/server/db';
import { apiError, badRequest, protectedApi, readJson, validationError } from '$lib/server/http';
import { deleteTask, updateTask } from '$lib/server/tasks';

export const PUT = protectedApi(async ({ params, request }, user) => {
	const id = v.safeParse(TaskIdSchema, params.id);
	if (!id.success) {
		return validationError(id.issues, 'Task not found');
	}

	const body = await readJson(request);
	if (!body.ok) {
		return badRequest('Please check the task details');
	}

	const parsed = v.safeParse(UpdateTaskSchema, body.result);
	if (!parsed.success) {
		return validationError(parsed.issues, 'Please check the task details');
	}

	const result = await updateTask(db, user.id, id.output, parsed.output);
	if (!result.ok) {
		return result.message === 'Task not found'
			? apiError(404, result.message)
			: badRequest(result.message);
	}

	return json({ id: result.id });
});

export const DELETE = protectedApi(async ({ params }, user) => {
	const parsed = v.safeParse(TaskIdSchema, params.id);
	if (!parsed.success) {
		return validationError(parsed.issues, 'Task not found');
	}

	const result = await deleteTask(db, user.id, parsed.output);
	if (!result.ok) {
		return apiError(404, result.message);
	}

	return json({ id: result.id });
});
