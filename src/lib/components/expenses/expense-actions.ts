export type ExpenseAction = 'delete' | 'update-tags' | 'update-expense';

export type ExpenseActionItem = {
	action: ExpenseAction;
	label: string;
	variant?: 'destructive';
};

export const expenseActionItems: ExpenseActionItem[] = [
	{ action: 'delete', label: 'Delete', variant: 'destructive' },
	{ action: 'update-tags', label: 'Update tag' },
	{ action: 'update-expense', label: 'Update expense' }
];

export const groupedExpenseActionItems = expenseActionItems.filter(
	(item) => item.action !== 'delete'
);
