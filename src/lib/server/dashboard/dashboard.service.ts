import type { Database } from '$lib/server/db/create-db';
import {
	getMonthExpenseTotal,
	listMonthTagSpending,
	listRecentMonthExpenseGroups,
	type MonthTagSpending
} from '$lib/server/expenses';
import { previousYearMonth, type YearMonth } from '$lib/utils/date';

const RECENT_EXPENSE_LIMIT = 5;

export type DashboardTagSpending = {
	name: string;
	amount: number;
	share: number;
};

export type DashboardRecentExpense = {
	description: string;
	tag: string | null;
	expenseDate: string;
	count: number;
	amount: number;
};

export type Dashboard = {
	month: YearMonth;
	spent: number;
	previousMonthSpent: number;
	tagSpending: DashboardTagSpending[];
	recentExpenses: DashboardRecentExpense[];
};

export async function getDashboard(
	db: Database,
	userId: string,
	month: YearMonth
): Promise<Dashboard> {
	const previousMonth = previousYearMonth(month);
	const [spent, previousMonthSpent, tagTotals, recentExpenses] = await Promise.all([
		getMonthExpenseTotal(db, userId, month),
		getMonthExpenseTotal(db, userId, previousMonth),
		listMonthTagSpending(db, userId, month),
		listRecentMonthExpenseGroups(db, userId, month, RECENT_EXPENSE_LIMIT)
	]);

	return {
		month,
		spent,
		previousMonthSpent,
		tagSpending: withTagShare(tagTotals, spent),
		recentExpenses
	};
}

function withTagShare(tagTotals: MonthTagSpending[], total: number): DashboardTagSpending[] {
	return tagTotals.map(({ name, amount }) => ({
		name: name ?? 'Untagged',
		amount,
		share: total === 0 ? 0 : (amount / total) * 100
	}));
}
