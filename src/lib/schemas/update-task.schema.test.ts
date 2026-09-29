import * as v from 'valibot';
import { describe, expect, test } from 'vitest';

import { UpdateTaskSchema } from './update-task.schema';

describe('UpdateTaskSchema', () => {
	test('normalizes the editable task fields', () => {
		const result = v.safeParse(UpdateTaskSchema, {
			name: '  File   taxes  ',
			dueOn: '10/15/2026',
			status: 'done',
			assignedTo: 'user-1'
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.output).toEqual({
			name: 'File taxes',
			dueOn: '2026-10-15',
			status: 'done',
			assignedTo: 'user-1',
			finishedAt: null
		});
	});

	test('normalizes a user-selected finished date', () => {
		const result = v.safeParse(UpdateTaskSchema, {
			name: 'File taxes',
			dueOn: '2026-10-15',
			status: 'done',
			assignedTo: 'user-1',
			finishedAt: '10/12/2026'
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.output.finishedAt).toBe('2026-10-12');
	});

	test('rejects an invalid finished date', () => {
		expect(
			v.safeParse(UpdateTaskSchema, {
				name: 'File taxes',
				dueOn: '2026-10-15',
				status: 'done',
				assignedTo: 'user-1',
				finishedAt: 'not a date'
			}).success
		).toBe(false);
	});

	test('requires a valid status and assignee', () => {
		expect(v.safeParse(UpdateTaskSchema, { name: 'File taxes', dueOn: '2026-10-15' }).success).toBe(
			false
		);
		expect(
			v.safeParse(UpdateTaskSchema, { name: 'File taxes', dueOn: '2026-10-15', status: 'all' })
				.success
		).toBe(false);
		expect(
			v.safeParse(UpdateTaskSchema, {
				name: 'File taxes',
				dueOn: '2026-10-15',
				status: 'done'
			}).success
		).toBe(false);
	});
});
