import { parsePage } from '$lib/utils/pagination';

const TOP_TAG_COUNT = 3;

export type ExpenseGrouping = 'none' | 'tag' | 'expense';

export type ExpenseGroupingOption = {
	value: ExpenseGrouping;
	label: string;
};

export const EXPENSE_GROUPING_OPTIONS: readonly ExpenseGroupingOption[] = [
	{ value: 'none', label: 'None' },
	{ value: 'tag', label: 'By Tag' },
	{ value: 'expense', label: 'By Expense' }
];

export type ExpenseReportQuery = {
	search: string;
	group: ExpenseGrouping;
	page: number;
};

export type MonthTagAmount = {
	month: number;
	tag: string | null;
	amount: number;
};

export type TagAmount = {
	tag: string | null;
	amount: number;
};

export type MonthlyReport = {
	month: number;
	total: number;
	topTags: TagAmount[];
};

type MonthAccumulator = {
	total: number;
	tags: TagAmount[];
};

export function parseExpenseGrouping(value: string | null | undefined): ExpenseGrouping {
	const normalized = value?.trim().toLowerCase();
	const option = EXPENSE_GROUPING_OPTIONS.find((option) => option.value === normalized);

	return option?.value ?? 'none';
}

export function parseExpenseReportQuery(params: URLSearchParams): ExpenseReportQuery {
	return {
		search: params.get('q')?.trim() ?? '',
		group: parseExpenseGrouping(params.get('group')),
		page: parsePage(params.get('page'))
	};
}

export function toExpenseReportParams({ search, group, page }: ExpenseReportQuery): string {
	const params = new URLSearchParams();
	if (search) params.set('q', search);
	if (group !== 'none') params.set('group', group);
	if (page > 1) params.set('page', String(page));

	return params.toString();
}

export function buildMonthlyReports(rows: MonthTagAmount[]): MonthlyReport[] {
	const months = new Map<number, MonthAccumulator>();

	for (const row of rows) {
		const month = months.get(row.month) ?? { total: 0, tags: [] };
		month.total += row.amount;
		month.tags.push({ tag: row.tag, amount: row.amount });
		months.set(row.month, month);
	}

	return Array.from(months, ([month, { total, tags }]) => ({
		month,
		total,
		topTags: tags.sort(byAmountDesc).slice(0, TOP_TAG_COUNT)
	})).sort((a, b) => a.month - b.month);
}

function byAmountDesc(a: TagAmount, b: TagAmount) {
	return b.amount - a.amount || (a.tag ?? '').localeCompare(b.tag ?? '');
}
