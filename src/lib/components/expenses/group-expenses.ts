export type Expense = {
	id: string;
	expenseDate: string;
	amount: number;
	description: string;
	refinedDescription: string | null;
};

export type ExpenseGroup = {
	refinedDescription: string;
	count: number;
	amount: number;
};

export function groupExpenses(expenses: Expense[]): ExpenseGroup[] {
	const groups = new Map<string, ExpenseGroup>();

	for (const expense of expenses) {
		const refinedDescription = expense.refinedDescription || expense.description;
		const group = groups.get(refinedDescription);

		if (group) {
			group.count += 1;
			group.amount += expense.amount;
			continue;
		}

		groups.set(refinedDescription, { refinedDescription, count: 1, amount: expense.amount });
	}

	return Array.from(groups.values());
}
