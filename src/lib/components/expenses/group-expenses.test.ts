import { describe, expect, test } from 'vitest';

import { groupExpenses, type Expense } from './group-expenses';

function expense(overrides: Partial<Expense> & Pick<Expense, 'id'>): Expense {
	return {
		expenseDate: '2026-09-01',
		amount: 100,
		description: 'Coffee',
		refinedDescription: null,
		...overrides
	};
}

describe('groupExpenses', () => {
	test('returns an empty list when there are no expenses', () => {
		expect(groupExpenses([])).toEqual([]);
	});

	test('groups by refined description and sums count and amount', () => {
		expect(
			groupExpenses([
				expense({ id: '1', description: 'SQ *COFFEE', refinedDescription: 'Coffee', amount: 250 }),
				expense({ id: '2', description: 'CAFE', refinedDescription: 'Coffee', amount: 400 }),
				expense({ id: '3', description: 'UBER', refinedDescription: 'Ride', amount: 1200 })
			])
		).toEqual([
			{ refinedDescription: 'Coffee', count: 2, amount: 650 },
			{ refinedDescription: 'Ride', count: 1, amount: 1200 }
		]);
	});

	test('falls back to the raw description when refined is missing', () => {
		expect(
			groupExpenses([
				expense({ id: '1', description: 'Coffee', refinedDescription: null, amount: 250 }),
				expense({ id: '2', description: 'Coffee', refinedDescription: '', amount: 150 })
			])
		).toEqual([{ refinedDescription: 'Coffee', count: 2, amount: 400 }]);
	});
});
