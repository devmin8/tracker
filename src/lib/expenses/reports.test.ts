import { describe, expect, test } from 'vitest';

import {
	buildMonthlyReports,
	parseExpenseGrouping,
	parseExpenseReportQuery,
	toExpenseReportParams
} from './reports';

describe('parseExpenseGrouping', () => {
	test('reads known grouping values', () => {
		expect(parseExpenseGrouping('tag')).toBe('tag');
		expect(parseExpenseGrouping(' Expense ')).toBe('expense');
	});

	test('falls back to none for missing or unknown values', () => {
		expect(parseExpenseGrouping(null)).toBe('none');
		expect(parseExpenseGrouping('month')).toBe('none');
	});
});

describe('parseExpenseReportQuery', () => {
	test('defaults to an ungrouped first page without search', () => {
		expect(parseExpenseReportQuery(new URLSearchParams())).toEqual({
			search: '',
			group: 'none',
			page: 1
		});
	});

	test('reads search, grouping, and page', () => {
		expect(parseExpenseReportQuery(new URLSearchParams('q=+coffee+&group=tag&page=3'))).toEqual({
			search: 'coffee',
			group: 'tag',
			page: 3
		});
	});
});

describe('toExpenseReportParams', () => {
	test('omits default values', () => {
		expect(toExpenseReportParams({ search: '', group: 'none', page: 1 })).toBe('');
	});

	test('round trips through parseExpenseReportQuery', () => {
		const query = { search: 'food & drinks', group: 'expense', page: 2 } as const;
		const params = new URLSearchParams(toExpenseReportParams(query));

		expect(parseExpenseReportQuery(params)).toEqual(query);
	});
});

describe('buildMonthlyReports', () => {
	test('returns an empty list when there is no spending', () => {
		expect(buildMonthlyReports([])).toEqual([]);
	});

	test('totals each month and keeps the top three tags by amount', () => {
		expect(
			buildMonthlyReports([
				{ month: 3, tag: 'Food', amount: 500 },
				{ month: 1, tag: 'Rent', amount: 2000 },
				{ month: 1, tag: 'Food', amount: 300 },
				{ month: 1, tag: null, amount: 400 },
				{ month: 1, tag: 'Fuel', amount: 100 }
			])
		).toEqual([
			{
				month: 1,
				total: 2800,
				topTags: [
					{ tag: 'Rent', amount: 2000 },
					{ tag: null, amount: 400 },
					{ tag: 'Food', amount: 300 }
				]
			},
			{ month: 3, total: 500, topTags: [{ tag: 'Food', amount: 500 }] }
		]);
	});

	test('breaks amount ties by tag name', () => {
		const [report] = buildMonthlyReports([
			{ month: 2, tag: 'Travel', amount: 100 },
			{ month: 2, tag: 'Bills', amount: 100 }
		]);

		expect(report?.topTags.map((tag) => tag.tag)).toEqual(['Bills', 'Travel']);
	});

	test('keeps untagged spending distinct from a tag named "Untagged"', () => {
		const [report] = buildMonthlyReports([
			{ month: 4, tag: null, amount: 200 },
			{ month: 4, tag: 'Untagged', amount: 100 }
		]);

		expect(report?.topTags.map((tag) => tag.tag)).toEqual([null, 'Untagged']);
	});
});
