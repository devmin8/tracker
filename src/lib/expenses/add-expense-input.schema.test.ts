import * as v from 'valibot';
import { describe, expect, test } from 'vitest';

import { AddExpenseInputSchema } from './add-expense-input.schema';

describe('AddExpenseInputSchema', () => {
	test('accepts a canonical expense payload', () => {
		const result = v.safeParse(AddExpenseInputSchema, {
			amount: 450,
			expenseDate: '2026-09-13',
			description: 'Coffee',
			refinedDescription: 'Coffee'
		});

		expect(result.success).toBe(true);
	});

	test('rejects timestamps and non-canonical dates', () => {
		expect(
			v.safeParse(AddExpenseInputSchema, {
				amount: 450,
				expenseDate: '2026-09-13T00:00:00.000Z',
				description: 'Coffee',
				refinedDescription: 'Coffee',
				tagId: 'tag-1'
			}).issues?.[0]?.message
		).toBe('Enter a valid date');
	});
});
