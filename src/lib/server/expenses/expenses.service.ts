import { db } from '$lib/server/db';
import { expense } from '$lib/server/db/schema';

import { cleanse, parseExpenseCsv, type CleansedExpense } from './from-csv';

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const INSERT_BATCH_SIZE = 500;

export type ImportExpensesResult =
	| { ok: true; rowCount: number }
	| { ok: false; message: string; status: 400 };

export async function importExpensesFromCsv(
	file: FormDataEntryValue | null,
	userId: string
): Promise<ImportExpensesResult> {
	const validated = validateCsvFile(file);
	if (!validated.ok) return validated;

	const parsed = parseExpenseCsv(await validated.file.text());
	if (!parsed.ok) {
		return { ok: false, message: 'The CSV could not be parsed', status: 400 };
	}

	const expenses = cleanse(parsed.rows);
	await saveExpenses(expenses, userId);

	return { ok: true, rowCount: expenses.length };
}

function validateCsvFile(
	file: FormDataEntryValue | null
): { ok: true; file: File } | (ImportExpensesResult & { ok: false }) {
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

export async function saveExpenses(expenses: CleansedExpense[], userId: string) {
	if (expenses.length === 0) return;

	// Keep chunked inserts all-or-nothing.
	await db.transaction(async (tx) => {
		for (let start = 0; start < expenses.length; start += INSERT_BATCH_SIZE) {
			const rows = expenses.slice(start, start + INSERT_BATCH_SIZE).map((row) => ({
				date: row.date,
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
