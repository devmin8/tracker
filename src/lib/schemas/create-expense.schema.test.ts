import * as v from 'valibot';
import { describe, expect, test } from 'vitest';

import { CreateExpenseSchema } from './create-expense.schema';

describe('CreateExpenseSchema', () => {
	test('normalizes form fields and derives the refined description', () => {
		const result = v.safeParse(CreateExpenseSchema, {
			amount: '$12.50',
			expenseDate: '09/13/2026',
			description: '  Coffee   shop  ',
			comments: '  Morning run  '
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.output).toEqual({
			amount: 1250,
			expenseDate: '2026-09-13',
			description: 'Coffee shop',
			refinedDescription: 'Coffee shop',
			comments: 'Morning run'
		});
	});
});
