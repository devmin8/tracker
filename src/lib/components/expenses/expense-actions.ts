export type ExpenseAction = 'delete' | 'update-tags' | 'update-expense';

export type ExpenseActionItem = {
	action: ExpenseAction;
	label: string;
	variant?: 'destructive';
};

export const expenseActionItems: ExpenseActionItem[] = [
	{ action: 'update-expense', label: 'Update expense' },
	{ action: 'update-tags', label: 'Update tag' },
	{ action: 'delete', label: 'Delete expense', variant: 'destructive' }
];

export const groupedExpenseActionItems = expenseActionItems.filter(
	(item) => item.action === 'update-tags'
);
