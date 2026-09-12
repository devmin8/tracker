import { and, asc, desc, eq, gte, lt } from 'drizzle-orm';
import * as v from 'valibot';

import type { Database } from '$lib/server/db/create-db';
import { expense } from '$lib/server/db/schema';
import {
	formatYearMonth,
	parseYearMonth,
	YEAR_MONTH_PATTERN,
	yearMonthRange,
	type YearMonth
} from '$lib/utils/date';

import { parseExpenseCsv, type CleansedExpense } from './csv-util';

const YearMonthSchema = v.pipe(
	v.string(),
	v.trim(),
	v.regex(YEAR_MONTH_PATTERN, 'Month must be YYYY-MM')
);

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const INSERT_BATCH_SIZE = 500;

type ImportError = { ok: false; message: string; status: 400 };
type ParsedImport = { month: YearMonth; expenses: CleansedExpense[] };

export type ImportResult = { ok: true; rowCount: number } | ImportError;
export type ParseImportResult = ({ ok: true } & ParsedImport) | ImportError;

export async function parseImportedFile(
	file: FormDataEntryValue | null,
	month: FormDataEntryValue | null
): Promise<ParseImportResult> {
	const csvFile = validateCsvFile(file);
	if (!csvFile.ok) {
		return csvFile;
	}

	const yearMonth = validateMonth(month);
	if (!yearMonth.ok) {
		return yearMonth;
	}

	const parsed = parseExpenseCsv(await csvFile.file.text());
	if (!parsed.ok) {
		return { ok: false, message: 'The CSV could not be parsed', status: 400 };
	}

	const { start, end } = yearMonthRange(yearMonth.month);
	const expenses = parsed.expenses.filter(
		(row) => row.expenseDate >= start && row.expenseDate < end
	);
	if (expenses.length === 0) {
		return {
			ok: false,
			message: 'No expenses found for the selected month',
			status: 400
		};
	}

	return { ok: true, month: yearMonth.month, expenses };
}

export async function importExpenses(
	file: FormDataEntryValue | null,
	userId: string,
	month: FormDataEntryValue | null,
	db: Database
): Promise<ImportResult> {
	const parsed = await parseImportedFile(file, month);
	if (!parsed.ok) {
		return parsed;
	}

	await saveMonthExpenses(db, userId, parsed);
	return { ok: true, rowCount: parsed.expenses.length };
}

export type ListedExpense = {
	id: string;
	expenseDate: string;
	amount: number;
	description: string;
	refinedDescription: string | null;
};

export async function listMonthExpenses(
	db: Database,
	userId: string,
	month: YearMonth
): Promise<ListedExpense[]> {
	const { start, end } = yearMonthRange(month);

	return db
		.select({
			id: expense.id,
			expenseDate: expense.expenseDate,
			amount: expense.amount,
			description: expense.description,
			refinedDescription: expense.refinedDescription
		})
		.from(expense)
		.where(
			and(
				eq(expense.createdBy, userId),
				gte(expense.expenseDate, start),
				lt(expense.expenseDate, end)
			)
		)
		.orderBy(desc(expense.expenseDate), asc(expense.description));
}

// == local functions ==

type CsvResult = { ok: true; file: File } | ImportError;

function validateCsvFile(file: FormDataEntryValue | null): CsvResult {
	if (!(file instanceof File)) {
		return { ok: false, message: 'A CSV file is required', status: 400 };
	}

	if (!file.name.toLowerCase().endsWith('.csv')) {
		return { ok: false, message: 'Only CSV files are supported', status: 400 };
	}

	if (file.size > MAX_FILE_SIZE) {
		return { ok: false, message: 'Files must be 1 MB or smaller', status: 400 };
	}

	return { ok: true, file };
}

type MonthResult = { ok: true; month: YearMonth } | ImportError;

function validateMonth(value: FormDataEntryValue | null): MonthResult {
	if (typeof value !== 'string' || value.trim() === '') {
		return { ok: false, message: 'A month is required', status: 400 };
	}

	const result = v.safeParse(YearMonthSchema, value);
	if (!result.success) {
		return {
			ok: false,
			message: result.issues[0]?.message ?? 'Month must be YYYY-MM',
			status: 400
		};
	}

	const parsed = parseYearMonth(result.output);
	if (!parsed) {
		return { ok: false, message: 'Month must be YYYY-MM', status: 400 };
	}

	return { ok: true, month: formatYearMonth(parsed) };
}

async function saveMonthExpenses(db: Database, userId: string, { month, expenses }: ParsedImport) {
	const { start, end } = yearMonthRange(month);
	const importedAt = new Date();

	await db.transaction(async (tx) => {
		await tx.delete(expense).where(
			and(
				eq(expense.createdBy, userId),
				gte(expense.expenseDate, start),
				// end is the 1st of next month, so lt (not lte) keeps [start, end)
				lt(expense.expenseDate, end)
			)
		);

		for (let batchStart = 0; batchStart < expenses.length; batchStart += INSERT_BATCH_SIZE) {
			const rows = expenses.slice(batchStart, batchStart + INSERT_BATCH_SIZE).map((row) => ({
				expenseDate: row.expenseDate,
				importedAt,
				amount: row.amount,
				description: row.description,
				refinedDescription: row.refinedDescription,
				createdBy: userId,
				updatedBy: userId
			}));

			await tx.insert(expense).values(rows);
		}
	});
}
