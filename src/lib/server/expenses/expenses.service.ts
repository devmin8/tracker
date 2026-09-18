import { and, asc, desc, eq, gte, lt, sql } from 'drizzle-orm';

import type { Expense } from '$lib/expenses';
import type { CreateExpenseInput } from '$lib/schemas/create-expense.schema';
import type { UpdateExpenseInput } from '$lib/schemas/update-expense.schema';
import type { Database } from '$lib/server/db/create-db';
import { descriptionTag, expense, tag, type ExpenseInsert } from '$lib/server/db/schema';
import { yearMonthRange, type YearMonth } from '$lib/utils/date';

import { parseExpenseCsv, type CleansedExpense } from './csv-util';

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const INSERT_BATCH_SIZE = 500;

type ImportError = { ok: false; message: string };
type ParsedImport = { month: YearMonth; expenses: CleansedExpense[] };

export type ImportResult = { ok: true; rowCount: number } | ImportError;
export type ParseImportResult = ({ ok: true } & ParsedImport) | ImportError;

export async function parseImportedFile(file: File, month: YearMonth): Promise<ParseImportResult> {
	const csvFile = validateCsvFile(file);
	if (!csvFile.ok) {
		return csvFile;
	}

	const parsed = parseExpenseCsv(await file.text());
	if (!parsed.ok) {
		return { ok: false, message: 'The CSV could not be parsed' };
	}

	const { includes } = monthBounds(month);
	const expenses = parsed.expenses.filter((row) => includes(row.expenseDate));
	if (expenses.length === 0) {
		return {
			ok: false,
			message: 'No expenses found for the selected month'
		};
	}

	return { ok: true, month, expenses };
}

export async function importExpenses(
	db: Database,
	userId: string,
	file: File,
	month: YearMonth
): Promise<ImportResult> {
	const parsed = await parseImportedFile(file, month);
	if (!parsed.ok) {
		return parsed;
	}

	await saveMonthExpenses(db, userId, parsed);
	return { ok: true, rowCount: parsed.expenses.length };
}

export type ListedExpense = Expense;

export async function listMonthExpenses(
	db: Database,
	userId: string,
	month: YearMonth
): Promise<ListedExpense[]> {
	return db
		.select({
			id: expense.id,
			expenseDate: expense.expenseDate,
			amount: expense.amount,
			description: expense.description,
			refinedDescription: expense.refinedDescription,
			comments: expense.comments,
			tagId: descriptionTag.tagId,
			tag: tag.name
		})
		.from(expense)
		.leftJoin(
			descriptionTag,
			and(
				eq(descriptionTag.userId, expense.createdBy),
				eq(descriptionTag.refinedDescription, expense.refinedDescription)
			)
		)
		.leftJoin(tag, and(eq(tag.userId, expense.createdBy), eq(tag.id, descriptionTag.tagId)))
		.where(whereUserExpensesInMonth(userId, month))
		.orderBy(desc(expense.expenseDate), asc(expense.description));
}

export async function getMonthExpenseTotal(db: Database, userId: string, month: YearMonth) {
	const [result] = await db
		.select({ amount: sql<number>`coalesce(sum(${expense.amount}), 0)` })
		.from(expense)
		.where(whereUserExpensesInMonth(userId, month));

	return result?.amount ?? 0;
}

export type MonthTagSpending = {
	name: string | null;
	amount: number;
};

export async function listMonthTagSpending(
	db: Database,
	userId: string,
	month: YearMonth
): Promise<MonthTagSpending[]> {
	const amount = sql<number>`coalesce(sum(${expense.amount}), 0)`;

	return db
		.select({
			name: tag.name,
			amount
		})
		.from(expense)
		.leftJoin(
			descriptionTag,
			and(
				eq(descriptionTag.userId, expense.createdBy),
				eq(descriptionTag.refinedDescription, expense.refinedDescription)
			)
		)
		.leftJoin(tag, and(eq(tag.userId, expense.createdBy), eq(tag.id, descriptionTag.tagId)))
		.where(whereUserExpensesInMonth(userId, month))
		.groupBy(tag.name)
		.orderBy(desc(amount));
}

export type RecentGroupedExpense = {
	description: string;
	tag: string | null;
	expenseDate: string;
	count: number;
	amount: number;
};

export async function listRecentMonthExpenseGroups(
	db: Database,
	userId: string,
	month: YearMonth,
	limit: number
): Promise<RecentGroupedExpense[]> {
	const latestDate = sql<string>`max(${expense.expenseDate})`;
	const amount = sql<number>`coalesce(sum(${expense.amount}), 0)`;

	return db
		.select({
			description: expense.refinedDescription,
			tag: tag.name,
			expenseDate: latestDate,
			count: sql<number>`count(*)`,
			amount
		})
		.from(expense)
		.leftJoin(
			descriptionTag,
			and(
				eq(descriptionTag.userId, expense.createdBy),
				eq(descriptionTag.refinedDescription, expense.refinedDescription)
			)
		)
		.leftJoin(tag, and(eq(tag.userId, expense.createdBy), eq(tag.id, descriptionTag.tagId)))
		.where(whereUserExpensesInMonth(userId, month))
		.groupBy(expense.refinedDescription, tag.name)
		.orderBy(desc(latestDate), asc(expense.refinedDescription))
		.limit(limit);
}

export type ExpenseWriteResult = { ok: true; id: string } | { ok: false; message: string };

export async function createExpense(
	db: Database,
	userId: string,
	input: CreateExpenseInput
): Promise<ExpenseWriteResult> {
	const created = await db.transaction(async (tx) => {
		const [row] = await tx
			.insert(expense)
			.values({
				expenseDate: input.expenseDate,
				amount: input.amount,
				description: input.description,
				refinedDescription: input.refinedDescription,
				comments: input.comments,
				createdBy: userId,
				updatedBy: userId,
				source: 'manual'
			} satisfies ExpenseInsert)
			.returning({ id: expense.id });

		if (!row) throw new Error('Expense insert did not return an id');

		return row;
	});

	return { ok: true, id: created.id };
}

export async function updateExpense(
	db: Database,
	userId: string,
	expenseId: string,
	input: UpdateExpenseInput
): Promise<ExpenseWriteResult> {
	const updated = await db.transaction(async (tx) => {
		const [row] = await tx
			.update(expense)
			.set({
				expenseDate: input.expenseDate,
				amount: input.amount,
				comments: input.comments ?? null,
				updatedBy: userId
			})
			.where(and(eq(expense.id, expenseId), eq(expense.createdBy, userId)))
			.returning({ id: expense.id });

		if (!row) return undefined;

		return row;
	});

	if (!updated) {
		return { ok: false, message: 'Expense not found' };
	}

	return { ok: true, id: updated.id };
}

export async function deleteExpense(
	db: Database,
	userId: string,
	expenseId: string
): Promise<ExpenseWriteResult> {
	const [deleted] = await db
		.delete(expense)
		.where(and(eq(expense.id, expenseId), eq(expense.createdBy, userId)))
		.returning({ id: expense.id });

	if (!deleted) {
		return { ok: false, message: 'Expense not found' };
	}

	return { ok: true, id: deleted.id };
}

// == local functions ==

type CsvResult = { ok: true } | ImportError;

function validateCsvFile(file: File): CsvResult {
	if (!file.name.toLowerCase().endsWith('.csv')) {
		return { ok: false, message: 'Only CSV files are supported' };
	}

	if (file.size > MAX_FILE_SIZE) {
		return { ok: false, message: 'Files must be 1 MB or smaller' };
	}

	return { ok: true };
}

function whereUserExpensesInMonth(userId: string, month: YearMonth) {
	const { start, end } = yearMonthRange(month);

	return and(
		eq(expense.createdBy, userId),
		gte(expense.expenseDate, start),
		lt(expense.expenseDate, end)
	);
}

function monthBounds(month: YearMonth) {
	const { start, end } = yearMonthRange(month);

	return {
		start,
		end,
		includes: (date: string) => date >= start && date < end
	};
}

async function saveMonthExpenses(db: Database, userId: string, { month, expenses }: ParsedImport) {
	const importedAt = new Date();
	const { start, end } = yearMonthRange(month);

	await db.transaction(async (tx) => {
		await tx
			.delete(expense)
			.where(
				and(
					eq(expense.createdBy, userId),
					gte(expense.expenseDate, start),
					lt(expense.expenseDate, end),
					eq(expense.source, 'imported')
				)
			);

		for (let batchStart = 0; batchStart < expenses.length; batchStart += INSERT_BATCH_SIZE) {
			const rows: ExpenseInsert[] = expenses
				.slice(batchStart, batchStart + INSERT_BATCH_SIZE)
				.map((row) => ({
					expenseDate: row.expenseDate,
					importedAt,
					amount: row.amount,
					description: row.description,
					refinedDescription: row.refinedDescription,
					createdBy: userId,
					updatedBy: userId,
					source: 'imported'
				}));

			await tx.insert(expense).values(rows);
		}
	});
}
