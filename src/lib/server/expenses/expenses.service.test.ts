import { describe, expect, test } from 'vitest';

import { parseImportedFile } from './expenses.service';

function csvFile(name: string, contents: string) {
	return new File([contents], name, { type: 'text/csv' });
}

describe('parseImportedFile', () => {
	test('returns a file error when the upload is missing or not a CSV', async () => {
		expect(await parseImportedFile(null, '2026-07')).toEqual({
			ok: false,
			message: 'A CSV file is required',
			status: 400
		});

		expect(
			await parseImportedFile(csvFile('expenses.txt', '07/18/2026,CAFE EXAMPLE,12.50,,'), '2026-07')
		).toEqual({
			ok: false,
			message: 'Only CSV files are supported',
			status: 400
		});

		expect(
			await parseImportedFile(csvFile('too-big.csv', 'x'.repeat(1 * 1024 * 1024 + 1)), '2026-07')
		).toEqual({
			ok: false,
			message: 'Files must be 1 MB or smaller',
			status: 400
		});
	});

	test('returns a month error when the month is missing or invalid', async () => {
		const file = csvFile('expenses.csv', '07/18/2026,CAFE EXAMPLE,12.50,,');

		expect(await parseImportedFile(file, null)).toEqual({
			ok: false,
			message: 'A month is required',
			status: 400
		});

		expect(await parseImportedFile(file, '2026-13')).toEqual({
			ok: false,
			message: 'Month must be YYYY-MM',
			status: 400
		});
	});

	test('returns a parse error when the CSV cannot be parsed', async () => {
		expect(await parseImportedFile(csvFile('empty.csv', ''), '2026-07')).toEqual({
			ok: false,
			message: 'The CSV could not be parsed',
			status: 400
		});

		expect(
			await parseImportedFile(csvFile('malformed.csv', '07/18/2026,"CAFE EXAMPLE,12.50'), '2026-07')
		).toEqual({
			ok: false,
			message: 'The CSV could not be parsed',
			status: 400
		});
	});

	test('returns an error when no expenses fall in the selected month', async () => {
		expect(
			await parseImportedFile(csvFile('expenses.csv', '07/18/2026,CAFE EXAMPLE,12.50,,'), '2026-08')
		).toEqual({
			ok: false,
			message: 'No expenses found for the selected month',
			status: 400
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
			'2026-09'
		);

		expect(result).toEqual({
			ok: true,
			month: '2026-09',
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
