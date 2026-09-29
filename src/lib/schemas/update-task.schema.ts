import * as v from 'valibot';

import { TASK_STATUS_VALUES } from '$lib/tasks/task-status';
import { normalizeIsoDate } from '$lib/utils/date';

import { CreateTaskSchema } from './create-task.schema';

export const UpdateTaskSchema = v.object({
	...CreateTaskSchema.entries,
	status: v.picklist(TASK_STATUS_VALUES, 'Select a valid status'),
	finishedAt: v.pipe(
		v.optional(v.nullable(v.string()), null),
		v.check((value) => {
			if (value == null) return true;
			const trimmed = value.trim();
			if (trimmed === '') return true;
			return normalizeIsoDate(trimmed) !== null;
		}, 'Enter a valid finished date'),
		v.transform((value) => {
			if (value == null) return null;
			const trimmed = value.trim();
			if (trimmed === '') return null;
			return normalizeIsoDate(trimmed);
		})
	)
});

export type UpdateTaskInput = v.InferOutput<typeof UpdateTaskSchema>;
