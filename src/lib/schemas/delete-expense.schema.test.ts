import * as v from 'valibot';
import { describe, expect, test } from 'vitest';

import { DeleteExpenseSchema } from './delete-expense.schema';

describe('DeleteExpenseSchema', () => {
	test('accepts a trimmed expense id', () => {
		const result = v.safeParse(DeleteExpenseSchema, '  expense-1  ');

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.output).toBe('expense-1');
	});

	test('rejects a missing id', () => {
		const result = v.safeParse(DeleteExpenseSchema, '   ');

		expect(result.success).toBe(false);
		if (result.success) return;

		expect(result.issues[0]?.message).toBe('Expense not found');
	});
});
