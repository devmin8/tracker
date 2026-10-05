import { describe, expect, test } from 'vitest';

import { formatYearMonth } from '$lib/utils/date';

import { parseImportedFiles } from './import-util';

function csvFile(name: string, contents: string) {
	return new File([contents], name, { type: 'text/csv' });
}

const april = formatYearMonth({ year: 2026, month: 4 });

describe('parseImportedFiles', () => {
	test('requires at least one file', async () => {
		expect(await parseImportedFiles([], april)).toEqual({
			ok: false,
			message: 'At least one CSV file is required'
		});
	});

	test('rejects invalid files and identifies the file', async () => {
		for (const [file, message] of [
			[csvFile('expenses.txt', '04/18/2026,CAFE EXAMPLE,12.50,,'), 'Only CSV files are supported'],
			[csvFile('too-big.csv', 'x'.repeat(1 * 1024 * 1024 + 1)), 'Files must be 1 MB or smaller'],
			[csvFile('empty.csv', ''), 'The CSV could not be parsed'],
			[csvFile('malformed.csv', '04/18/2026,"CAFE EXAMPLE,12.50'), 'The CSV could not be parsed']
		] as const) {
			expect(
				await parseImportedFiles([csvFile('valid.csv', '04/01/2026,SHOP,1.00,,'), file], april)
			).toEqual({ ok: false, message: `${file.name}: ${message}` });
		}
	});

	test('returns an error when no files contain expenses for the selected month', async () => {
		expect(
			await parseImportedFiles(
				[
					csvFile('march.csv', '03/18/2026,CAFE EXAMPLE,12.50,,'),
					csvFile('may.csv', '05/18/2026,CAFE EXAMPLE,12.50,,')
				],
				april
			)
		).toEqual({ ok: false, message: 'No expenses found for the selected month' });
	});

	test('combines selected-month expenses from consecutive statements', async () => {
		const result = await parseImportedFiles(
			[
				csvFile(
					'march-april.csv',
					[
						'03/31/2026,March,1.00,,',
						'04/01/2026,April start,2.00,,',
						'04/18/2026,April first statement,3.00,,'
					].join('\n')
				),
				csvFile(
					'april-may.csv',
					[
						'04/19/2026,April second statement,4.00,,',
						'04/30/2026,April end,5.00,,',
						'04/30/2026,PAYMENT - THANK YOU,,10.00,',
						'05/01/2026,May,6.00,,'
					].join('\n')
				)
			],
			april
		);

		expect(result).toEqual({
			ok: true,
			month: april,
			expenses: [
				{
					expenseDate: '2026-04-01',
					amount: 200,
					description: 'April start',
					refinedDescription: 'April start'
				},
				{
					expenseDate: '2026-04-18',
					amount: 300,
					description: 'April first statement',
					refinedDescription: 'April first statement'
				},
				{
					expenseDate: '2026-04-19',
					amount: 400,
					description: 'April second statement',
					refinedDescription: 'April second statement'
				},
				{
					expenseDate: '2026-04-30',
					amount: 500,
					description: 'April end',
					refinedDescription: 'April end'
				}
			]
		});
	});

	test('ignores files with no expenses for the selected month', async () => {
		const relevant = csvFile('april.csv', '04/18/2026,CAFE EXAMPLE,12.50,,');
		expect(
			await parseImportedFiles([csvFile('march.csv', '03/18/2026,SHOP,1.00,,'), relevant], april)
		).toEqual(await parseImportedFiles([relevant], april));
	});
});
