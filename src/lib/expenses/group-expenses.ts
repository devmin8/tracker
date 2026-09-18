export type Expense = {
	id: string;
	expenseDate: string;
	amount: number;
	description: string;
	refinedDescription: string;
	comments: string | null;
	tagId: string | null;
	tag: string | null;
};

export type ExpenseGroup = {
	refinedDescription: string;
	tag: string | null;
	count: number;
	amount: number;
};

type GroupableExpense = Pick<Expense, 'refinedDescription' | 'tag' | 'amount'>;

export function groupExpenses(expenses: GroupableExpense[]): ExpenseGroup[] {
	const groups = new Map<string, ExpenseGroup>();

	for (const expense of expenses) {
		const group = groups.get(expense.refinedDescription);

		if (group) {
			group.count += 1;
			group.amount += expense.amount;
			continue;
		}

		groups.set(expense.refinedDescription, {
			refinedDescription: expense.refinedDescription,
			tag: expense.tag,
			count: 1,
			amount: expense.amount
		});
	}

	return Array.from(groups.values());
}
