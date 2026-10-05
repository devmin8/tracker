import { and, asc, count, desc, eq, gte, lt, or, sql, type AnyColumn, type SQL } from 'drizzle-orm';
import type { SQLiteAsyncSelect } from 'drizzle-orm/sqlite-core';

import {
	buildMonthlyReports,
	type Expense,
	type ExpenseGroup,
	type ExpenseGrouping,
	type ExpenseReportQuery,
	type MonthlyReport,
	type MonthTagAmount,
	type TagExpenseGroup
} from '$lib/expenses';
import type { Database } from '$lib/server/db/create-db';
import { descriptionTag, expense, tag } from '$lib/server/db/schema';
import { joinDescriptionTag, joinTag, listedExpenseColumns } from '$lib/server/expenses';
import { yearRange } from '$lib/utils/date';
import { pageOffset, paginate, type Pagination } from '$lib/utils/pagination';

export const EXPENSE_REPORT_PAGE_SIZE = 50;

export type YearlyReport = {
	year: number;
	total: number;
	months: MonthlyReport[];
};

export async function getYearlyReport(
	db: Database,
	userId: string,
	year: number
): Promise<YearlyReport> {
	const months = buildMonthlyReports(await listYearTagSpending(db, userId, year));

	return {
		year,
		total: months.reduce((sum, month) => sum + month.total, 0),
		months
	};
}

type ExpenseReportRows =
	| { group: 'none'; rows: Expense[] }
	| { group: 'expense'; rows: ExpenseGroup[] }
	| { group: 'tag'; rows: TagExpenseGroup[] };

type ExpenseReportPage = ExpenseReportRows & {
	pagination: Pagination;
};

export type ExpenseReport = ExpenseReportPage & {
	search: string;
	amount: number;
};

export async function getExpenseReport(
	db: Database,
	userId: string,
	{ search, group, page }: ExpenseReportQuery
): Promise<ExpenseReport> {
	const where = whereUserExpensesMatching(userId, search);

	const [amount, reportPage] = await Promise.all([
		sumExpenses(db, where),
		getExpenseReportPage(db, where, group, page)
	]);

	return { search, amount, ...reportPage };
}

async function getExpenseReportPage(
	db: Database,
	where: SQL | undefined,
	group: ExpenseGrouping,
	page: number
): Promise<ExpenseReportPage> {
	switch (group) {
		case 'tag':
			return { group, ...(await paginateQuery(db, selectTagGroups(db, where), page)) };
		case 'expense':
			return { group, ...(await paginateQuery(db, selectExpenseGroups(db, where), page)) };
		case 'none':
			return { group, ...(await paginateQuery(db, selectExpenses(db, where), page)) };
	}
}

async function paginateQuery<T extends SQLiteAsyncSelect>(
	db: Database,
	query: T,
	requestedPage: number
) {
	const [result] = await db.select({ total: count() }).from(query.as('rows'));
	const pagination = paginate(requestedPage, result?.total ?? 0, EXPENSE_REPORT_PAGE_SIZE);
	const rows = await query.limit(pagination.pageSize).offset(pageOffset(pagination));

	return { pagination, rows };
}

async function sumExpenses(db: Database, where: SQL | undefined): Promise<number> {
	const [result] = await db
		.select({ amount: sql<number>`coalesce(sum(${expense.amount}), 0)` })
		.from(expense)
		.leftJoin(descriptionTag, joinDescriptionTag)
		.leftJoin(tag, joinTag)
		.where(where);

	return result?.amount ?? 0;
}

function selectExpenses(db: Database, where: SQL | undefined) {
	return db
		.select(listedExpenseColumns)
		.from(expense)
		.leftJoin(descriptionTag, joinDescriptionTag)
		.leftJoin(tag, joinTag)
		.where(where)
		.orderBy(desc(expense.expenseDate), asc(expense.description), asc(expense.id))
		.$dynamic();
}

function selectExpenseGroups(db: Database, where: SQL | undefined) {
	const amount = sql<number>`sum(${expense.amount})`;

	return db
		.select({
			refinedDescription: expense.refinedDescription,
			tag: tag.name,
			count: count(),
			amount
		})
		.from(expense)
		.leftJoin(descriptionTag, joinDescriptionTag)
		.leftJoin(tag, joinTag)
		.where(where)
		.groupBy(expense.refinedDescription, tag.name)
		.orderBy(desc(amount), asc(expense.refinedDescription))
		.$dynamic();
}

function selectTagGroups(db: Database, where: SQL | undefined) {
	const amount = sql<number>`sum(${expense.amount})`;

	return db
		.select({
			tag: tag.name,
			count: count(),
			amount
		})
		.from(expense)
		.leftJoin(descriptionTag, joinDescriptionTag)
		.leftJoin(tag, joinTag)
		.where(where)
		.groupBy(tag.name)
		.orderBy(desc(amount), asc(tag.name))
		.$dynamic();
}

async function listYearTagSpending(
	db: Database,
	userId: string,
	year: number
): Promise<MonthTagAmount[]> {
	const month = sql<number>`cast(substr(${expense.expenseDate}, 6, 2) as integer)`;

	return db
		.select({
			month,
			tag: tag.name,
			amount: sql<number>`sum(${expense.amount})`
		})
		.from(expense)
		.leftJoin(descriptionTag, joinDescriptionTag)
		.leftJoin(tag, joinTag)
		.where(whereUserExpensesInYear(userId, year))
		.groupBy(month, tag.name);
}

function whereUserExpensesInYear(userId: string, year: number) {
	const { start, end } = yearRange(year);

	return and(
		eq(expense.createdBy, userId),
		gte(expense.expenseDate, start),
		lt(expense.expenseDate, end)
	);
}

// Requires `tag` to be joined: the search also matches tag names.
function whereUserExpensesMatching(userId: string, search: string) {
	const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
	const matchesSearch = search
		? or(
				likeEscaped(expense.description, pattern),
				likeEscaped(expense.refinedDescription, pattern),
				likeEscaped(tag.name, pattern)
			)
		: undefined;

	return and(eq(expense.createdBy, userId), matchesSearch);
}

function likeEscaped(column: AnyColumn, pattern: string) {
	return sql`${column} like ${pattern} escape '\\'`;
}
