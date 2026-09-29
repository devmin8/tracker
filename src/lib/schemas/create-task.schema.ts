import * as v from 'valibot';

import { TASK_STATUS_VALUES } from '$lib/tasks/task-status';
import { normalizeIsoDate } from '$lib/utils/date';

export const CreateTaskSchema = v.object({
	name: v.pipe(
		v.string(),
		v.trim(),
		v.transform((value) => value.replace(/\s+/g, ' ')),
		v.nonEmpty('Task name is required')
	),
	dueOn: v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty('Due date is required'),
		v.check((value) => normalizeIsoDate(value) !== null, 'Enter a valid date'),
		v.transform((value) => normalizeIsoDate(value) as string)
	),
	status: v.optional(v.picklist(TASK_STATUS_VALUES, 'Select a valid status'), 'open'),
	assignedTo: v.pipe(v.string(), v.trim(), v.nonEmpty('Assignee is required'))
});

export type CreateTaskInput = v.InferOutput<typeof CreateTaskSchema>;
