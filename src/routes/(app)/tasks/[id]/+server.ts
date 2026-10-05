import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { UpdateTaskSchema } from '$lib/schemas/update-task.schema';
import { db } from '$lib/server/db';
import { apiError, badRequest, protectedApi, readJson, validationError } from '$lib/server/http';
import { deleteTask, updateTask } from '$lib/server/tasks';

export const PUT = protectedApi(async ({ params, request }, user) => {
	const taskId = params.id;
	if (!taskId) return apiError(404, 'Task not found');

	const body = await readJson(request);
	if (!body.ok) {
		return badRequest('Please check the task details');
	}

	const parsed = v.safeParse(UpdateTaskSchema, body.result);
	if (!parsed.success) {
		return validationError(parsed.issues, 'Please check the task details');
	}

	const result = await updateTask(db, user.id, taskId, parsed.output);
	if (!result.ok) {
		return result.reason === 'not-found'
			? apiError(404, result.message)
			: badRequest(result.message);
	}

	return json({ id: result.id });
});

export const DELETE = protectedApi(async ({ params }, user) => {
	const taskId = params.id;
	if (!taskId) return apiError(404, 'Task not found');

	const result = await deleteTask(db, user.id, taskId);
	if (!result.ok) {
		return apiError(404, result.message);
	}

	return json({ id: result.id });
});
