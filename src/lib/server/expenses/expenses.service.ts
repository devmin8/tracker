import { and, asc, desc, eq, gte, lt, sql } from 'drizzle-orm';

import type { Expense } from '$lib/expenses';
import type { CreateExpenseInput } from '$lib/schemas/create-expense.schema';
import type { UpdateExpenseInput } from '$lib/schemas/update-expense.schema';
import type { Database } from '$lib/server/db/create-db';
import { descriptionTag, expense, tag, type ExpenseInsert } from '$lib/server/db/schema';
import { yearMonthRange, type YearMonth } from '$lib/utils/date';

import { joinDescriptionTag, joinTag, listedExpenseColumns } from './expense-query';
import { parseImportedFiles, type ParsedImport } from './import-util';

const INSERT_BATCH_SIZE = 500;

type ImportError = { ok: false; message: string };

export type ImportResult = { ok: true; rowCount: number } | ImportError;

export async function importTransactions(
	db: Database,
	userId: string,
	files: File[],
	month: YearMonth
): Promise<ImportResult> {
	const parsed = await parseImportedFiles(files, month);
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
	month: YearMonth,
	limit?: number
): Promise<ListedExpense[]> {
	const query = db
		.select(listedExpenseColumns)
		.from(expense)
		.leftJoin(descriptionTag, joinDescriptionTag)
		.leftJoin(tag, joinTag)
		.where(whereUserExpensesInMonth(userId, month))
		.orderBy(desc(expense.expenseDate), asc(expense.description));

	return limit === undefined ? query : query.limit(limit);
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
		.leftJoin(descriptionTag, joinDescriptionTag)
		.leftJoin(tag, joinTag)
		.where(whereUserExpensesInMonth(userId, month))
		.groupBy(tag.name)
		.orderBy(desc(amount));
}

export type ExpenseWriteResult = { ok: true; id: string } | { ok: false; message: string };

export async function createExpense(
	db: Database,
	userId: string,
	input: CreateExpenseInput
): Promise<ExpenseWriteResult> {
	const [created] = await db
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

	if (!created) throw new Error('Expense insert did not return an id');

	return { ok: true, id: created.id };
}

export async function updateExpense(
	db: Database,
	userId: string,
	expenseId: string,
	input: UpdateExpenseInput
): Promise<ExpenseWriteResult> {
	const [updated] = await db
		.update(expense)
		.set({
			expenseDate: input.expenseDate,
			amount: input.amount,
			comments: input.comments ?? null,
			updatedBy: userId
		})
		.where(and(eq(expense.id, expenseId), eq(expense.createdBy, userId)))
		.returning({ id: expense.id });

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

function whereUserExpensesInMonth(userId: string, month: YearMonth) {
	const { start, end } = yearMonthRange(month);

	return and(
		eq(expense.createdBy, userId),
		gte(expense.expenseDate, start),
		lt(expense.expenseDate, end)
	);
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
