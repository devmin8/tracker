import { and, asc, desc, eq, gte, lt } from 'drizzle-orm';
import * as v from 'valibot';

import type { Database } from '$lib/server/db/create-db';
import { expense } from '$lib/server/db/schema';
import { CALENDAR_MONTH_PATTERN, calendarMonthRange } from '$lib/utils/date';

import { parseExpenseCsv, type CleansedExpense } from './csv-util';

const CalendarMonthSchema = v.pipe(
	v.string(),
	v.trim(),
	v.regex(CALENDAR_MONTH_PATTERN, 'Month must be YYYY-MM')
);

export type CalendarMonth = v.InferOutput<typeof CalendarMonthSchema>;

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const INSERT_BATCH_SIZE = 500;

type ImportError = { ok: false; message: string; status: 400 };
type ParsedImport = { month: string; expenses: CleansedExpense[] };

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

	const calendarMonth = validateMonth(month);
	if (!calendarMonth.ok) {
		return calendarMonth;
	}

	const parsed = parseExpenseCsv(await csvFile.file.text());
	if (!parsed.ok) {
		return { ok: false, message: 'The CSV could not be parsed', status: 400 };
	}

	const { start, end } = calendarMonthRange(calendarMonth.month);
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

	return { ok: true, month: calendarMonth.month, expenses };
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
	month: string
): Promise<ListedExpense[]> {
	const { start, end } = calendarMonthRange(month);

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

type MonthResult = { ok: true; month: string } | ImportError;

function validateMonth(value: FormDataEntryValue | null): MonthResult {
	if (typeof value !== 'string' || value.trim() === '') {
		return { ok: false, message: 'A month is required', status: 400 };
	}

	const result = v.safeParse(CalendarMonthSchema, value);
	if (!result.success) {
		return {
			ok: false,
			message: result.issues[0]?.message ?? 'Month must be YYYY-MM',
			status: 400
		};
	}

	return { ok: true, month: result.output };
}

async function saveMonthExpenses(db: Database, userId: string, { month, expenses }: ParsedImport) {
	const { start, end } = calendarMonthRange(month);
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
