import * as v from 'valibot';
import { describe, expect, test } from 'vitest';

import { TaskIdSchema } from './task-id.schema';

describe('TaskIdSchema', () => {
	test('accepts a trimmed task id', () => {
		const result = v.safeParse(TaskIdSchema, '  task-1  ');

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.output).toBe('task-1');
	});

	test('rejects a missing id', () => {
		const result = v.safeParse(TaskIdSchema, '   ');

		expect(result.success).toBe(false);
		if (result.success) return;

		expect(result.issues[0]?.message).toBe('Task not found');
	});
});
