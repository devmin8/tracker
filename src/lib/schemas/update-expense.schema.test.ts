import * as v from 'valibot';
import { describe, expect, test } from 'vitest';

import { UpdateExpenseSchema } from './update-expense.schema';

describe('UpdateExpenseSchema', () => {
	test('accepts only editable expense fields', () => {
		const result = v.safeParse(UpdateExpenseSchema, {
			amount: '$12.50',
			expenseDate: '09/13/2026',
			comments: '  Morning run  '
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.output).toEqual({
			amount: 1250,
			expenseDate: '2026-09-13',
			comments: 'Morning run'
		});
	});

	test('drops non-editable fields', () => {
		const result = v.safeParse(UpdateExpenseSchema, {
			amount: '12.50',
			expenseDate: '2026-09-13',
			description: 'Coffee'
		});

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output).not.toHaveProperty('description');
	});
});
