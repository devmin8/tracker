export type TaskAction = 'delete' | 'update';

export type TaskActionItem = {
	action: TaskAction;
	label: string;
	variant?: 'destructive';
};

export const taskActionItems: TaskActionItem[] = [
	{ action: 'update', label: 'Update task' },
	{ action: 'delete', label: 'Delete task', variant: 'destructive' }
];
