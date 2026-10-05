import { type YearMonth, yearMonthRange } from '$lib/utils/date';

import { parseExpenseCsv, type CleansedExpense } from './csv-util';

const MAX_FILE_SIZE = 1 * 1024 * 1024;

type ImportError = { ok: false; message: string };
export type ParsedImport = { month: YearMonth; expenses: CleansedExpense[] };
export type ParseImportResult = ({ ok: true } & ParsedImport) | ImportError;

export async function parseImportedFiles(
	files: File[],
	month: YearMonth
): Promise<ParseImportResult> {
	if (files.length === 0) {
		return { ok: false, message: 'At least one CSV file is required' };
	}

	const { includes } = monthBounds(month);
	const expenses: CleansedExpense[] = [];
	for (const file of files) {
		const csvFile = validateCsvFile(file);
		if (!csvFile.ok) {
			return { ok: false, message: `${file.name}: ${csvFile.message}` };
		}

		const parsed = parseExpenseCsv(await file.text());
		if (!parsed.ok) {
			return { ok: false, message: `${file.name}: The CSV could not be parsed` };
		}

		expenses.push(...parsed.expenses.filter((row) => includes(row.expenseDate)));
	}
	if (expenses.length === 0) {
		return {
			ok: false,
			message: 'No expenses found for the selected month'
		};
	}

	return { ok: true, month, expenses };
}

function validateCsvFile(file: File): ImportError | { ok: true } {
	if (!file.name.toLowerCase().endsWith('.csv')) {
		return { ok: false, message: 'Only CSV files are supported' };
	}

	if (file.size > MAX_FILE_SIZE) {
		return { ok: false, message: 'Files must be 1 MB or smaller' };
	}

	return { ok: true };
}

function monthBounds(month: YearMonth) {
	const { start, end } = yearMonthRange(month);

	return {
		includes: (date: string) => date >= start && date < end
	};
}
