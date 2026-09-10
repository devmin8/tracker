import { format } from 'date-fns';
import { describe, expect, test } from 'vitest';

import { parseExpenseCsv, type CleansedExpense } from './csv-util';

function csv(...rows: string[]) {
	return rows.join('\n');
}

function expenseSnapshot(expense: CleansedExpense) {
	return {
		date: format(expense.date, 'yyyy-MM-dd'),
		amount: expense.amount,
		description: expense.description,
		refinedDescription: expense.refinedDescription
	};
}

describe('parseExpenseCsv', () => {
	test('parses export rows and stores amounts as cents', () => {
		const result = parseExpenseCsv(
			csv('07/18/2026,CAFE EXAMPLE,12.50,,80.00', '2026-03-23,COFFEE SHOP #1001,4.50,,')
		);

		expect(result).toEqual({ ok: true, expenses: expect.any(Array) });
		if (!result.ok) return;

		expect(result.expenses.map(expenseSnapshot)).toEqual([
			{
				date: '2026-07-18',
				amount: 1250,
				description: 'CAFE EXAMPLE',
				refinedDescription: 'CAFE EXAMPLE'
			},
			{
				date: '2026-03-23',
				amount: 450,
				description: 'COFFEE SHOP #1001',
				refinedDescription: 'COFFEE SHOP'
			}
		]);
	});

	test('skips payments with an empty amount and PTS/SSV transfers', () => {
		const result = parseExpenseCsv(
			csv(
				'06/25/2026,PAYMENT - THANK YOU,,40.00,5.00',
				'07/01/2026,PTS TO:  00000000000,10.00,,',
				'07/02/2026,SSV TO:  00000000000,10.00,,',
				'07/03/2026,ssv to:  00000000000,10.00,,',
				'07/18/2026,CAFE EXAMPLE,12.50,,80.00'
			)
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.expenses.map(expenseSnapshot)).toEqual([
			{
				date: '2026-07-18',
				amount: 1250,
				description: 'CAFE EXAMPLE',
				refinedDescription: 'CAFE EXAMPLE'
			}
		]);
	});

	test('refines descriptions by stripping store numbers and transfer markers', () => {
		const result = parseExpenseCsv(
			csv(
				'07/03/2026,PRES/XXXX   _T,20.00,,',
				'07/04/2026,SEND E-TFR ***abc,15.00,,',
				'07/05/2026,pres/other,8.00,,'
			)
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.expenses.map((expense) => expense.refinedDescription)).toEqual([
			'PRES',
			'SEND E-TFR',
			'PRES'
		]);
	});

	test('accepts dollar signs, commas, negatives, and trimmed fields', () => {
		const result = parseExpenseCsv(
			csv(' 07/18/2026 ,  CAFE EXAMPLE  ,"$1,234.56",,', '2026-03-23,REFUND,-4.50,,')
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.expenses.map(expenseSnapshot)).toEqual([
			{
				date: '2026-07-18',
				amount: 123456,
				description: 'CAFE EXAMPLE',
				refinedDescription: 'CAFE EXAMPLE'
			},
			{
				date: '2026-03-23',
				amount: -450,
				description: 'REFUND',
				refinedDescription: 'REFUND'
			}
		]);
	});

	test('skips rows with invalid dates, empty descriptions, or unparseable amounts', () => {
		const result = parseExpenseCsv(
			csv(
				'not-a-date,CAFE EXAMPLE,12.50,,',
				'07/18/2026,,12.50,,',
				'07/18/2026,CAFE EXAMPLE,twelve,,',
				'07/18/2026,CAFE EXAMPLE,12.505,,',
				'07/18/2026,CAFE EXAMPLE,12.50,,'
			)
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.expenses).toHaveLength(1);
		expect(expenseSnapshot(result.expenses[0])).toEqual({
			date: '2026-07-18',
			amount: 1250,
			description: 'CAFE EXAMPLE',
			refinedDescription: 'CAFE EXAMPLE'
		});
	});

	test('keeps the original description when stripping markers would leave it empty', () => {
		const result = parseExpenseCsv('07/18/2026,#1001,12.50,,');

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.expenses[0]?.refinedDescription).toBe('#1001');
	});

	test('strips a leading BOM and ignores empty lines', () => {
		const result = parseExpenseCsv('\uFEFF07/18/2026,CAFE EXAMPLE,12.50,,80.00\n\n\n');

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.expenses).toHaveLength(1);
		expect(expenseSnapshot(result.expenses[0])).toEqual({
			date: '2026-07-18',
			amount: 1250,
			description: 'CAFE EXAMPLE',
			refinedDescription: 'CAFE EXAMPLE'
		});
	});

	test('returns a parse failure for empty input', () => {
		expect(parseExpenseCsv('')).toEqual({ ok: false });
	});

	test('returns a parse failure for malformed CSV', () => {
		expect(parseExpenseCsv('07/18/2026,"CAFE EXAMPLE,12.50')).toEqual({ ok: false });
	});
});
