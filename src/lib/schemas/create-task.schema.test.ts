import * as v from 'valibot';
import { describe, expect, test } from 'vitest';

import { CreateTaskSchema } from './create-task.schema';

describe('CreateTaskSchema', () => {
	test('normalizes form fields and defaults the status to open', () => {
		const result = v.safeParse(CreateTaskSchema, {
			name: '  Pay   electricity bill  ',
			dueOn: '09/30/2026',
			assignedTo: 'user-1'
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.output).toEqual({
			name: 'Pay electricity bill',
			dueOn: '2026-09-30',
			status: 'open',
			assignedTo: 'user-1'
		});
	});

	test('rejects missing names, invalid dates, unknown statuses, and missing assignees', () => {
		expect(
			v.safeParse(CreateTaskSchema, { name: '   ', dueOn: '2026-09-30', assignedTo: 'user-1' })
				.success
		).toBe(false);
		expect(
			v.safeParse(CreateTaskSchema, { name: 'Bills', dueOn: 'not a date', assignedTo: 'user-1' })
				.success
		).toBe(false);
		expect(
			v.safeParse(CreateTaskSchema, {
				name: 'Bills',
				dueOn: '2026-09-30',
				status: 'archived',
				assignedTo: 'user-1'
			}).success
		).toBe(false);
		expect(
			v.safeParse(CreateTaskSchema, { name: 'Bills', dueOn: '2026-09-30', assignedTo: '   ' })
				.success
		).toBe(false);
		expect(v.safeParse(CreateTaskSchema, { name: 'Bills', dueOn: '2026-09-30' }).success).toBe(
			false
		);
	});
});
