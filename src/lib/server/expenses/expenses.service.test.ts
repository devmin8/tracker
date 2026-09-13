import { describe, expect, test } from 'vitest';

import { formatYearMonth } from '$lib/utils/date';

import { parseImportedFile } from './expenses.service';

function csvFile(name: string, contents: string) {
	return new File([contents], name, { type: 'text/csv' });
}

const july = formatYearMonth({ year: 2026, month: 7 });
const august = formatYearMonth({ year: 2026, month: 8 });
const september = formatYearMonth({ year: 2026, month: 9 });

describe('parseImportedFile', () => {
	test('returns a file error when the upload is not a CSV', async () => {
		expect(
			await parseImportedFile(csvFile('expenses.txt', '07/18/2026,CAFE EXAMPLE,12.50,,'), july)
		).toEqual({
			ok: false,
			message: 'Only CSV files are supported'
		});

		expect(
			await parseImportedFile(csvFile('too-big.csv', 'x'.repeat(1 * 1024 * 1024 + 1)), july)
		).toEqual({
			ok: false,
			message: 'Files must be 1 MB or smaller'
		});
	});

	test('returns a parse error when the CSV cannot be parsed', async () => {
		expect(await parseImportedFile(csvFile('empty.csv', ''), july)).toEqual({
			ok: false,
			message: 'The CSV could not be parsed'
		});

		expect(
			await parseImportedFile(csvFile('malformed.csv', '07/18/2026,"CAFE EXAMPLE,12.50'), july)
		).toEqual({
			ok: false,
			message: 'The CSV could not be parsed'
		});
	});

	test('returns an error when no expenses fall in the selected month', async () => {
		expect(
			await parseImportedFile(csvFile('expenses.csv', '07/18/2026,CAFE EXAMPLE,12.50,,'), august)
		).toEqual({
			ok: false,
			message: 'No expenses found for the selected month'
		});
	});

	test('returns the selected month and only expenses that belong to it', async () => {
		const result = await parseImportedFile(
			csvFile(
				'expenses.csv',
				[
					'08/31/2026,August,1.00,,',
					'09/01/2026,September start,2.00,,',
					'09/30/2026,September end,3.00,,',
					'10/01/2026,October,4.00,,'
				].join('\n')
			),
			september
		);

		expect(result).toEqual({
			ok: true,
			month: september,
			expenses: [
				{
					expenseDate: '2026-09-01',
					amount: 200,
					description: 'September start',
					refinedDescription: 'September start'
				},
				{
					expenseDate: '2026-09-30',
					amount: 300,
					description: 'September end',
					refinedDescription: 'September end'
				}
			]
		});
	});
});
