import * as v from 'valibot';
import { describe, expect, test } from 'vitest';

import { AddExpenseSchema } from './add-expense.schema';

describe('AddExpenseSchema', () => {
	test('normalizes form fields and derives the refined description', () => {
		const result = v.safeParse(AddExpenseSchema, {
			amount: '$12.50',
			expenseDate: '09/13/2026',
			description: '  Coffee   shop  ',
			refinedDescription: 'Do not use this',
			tagId: 'tag-1',
			comments: '  Morning run  '
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.output).toEqual({
			amount: 1250,
			expenseDate: '2026-09-13',
			description: 'Coffee shop',
			refinedDescription: 'Coffee shop',
			tagId: 'tag-1',
			comments: 'Morning run'
		});
	});

	test('rejects missing or invalid fields', () => {
		expect(
			firstIssue({ amount: '', expenseDate: '2026-09-13', description: 'Coffee', tagId: 'tag-1' })
		).toBe('Amount is required');
		expect(
			firstIssue({
				amount: 'twelve',
				expenseDate: '2026-09-13',
				description: 'Coffee',
				tagId: 'tag-1'
			})
		).toBe('Enter a valid amount');
		expect(
			firstIssue({
				amount: '4.50',
				expenseDate: '2026-09-13T00:00:00Z',
				description: 'Coffee',
				tagId: 'tag-1'
			})
		).toBe('Enter a valid date');
		expect(
			firstIssue({ amount: '4.50', expenseDate: '2026-09-13', description: '   ', tagId: 'tag-1' })
		).toBe('Description is required');
	});
});

function firstIssue(input: Record<string, string>) {
	const result = v.safeParse(AddExpenseSchema, input);
	return result.success ? undefined : result.issues[0]?.message;
}
