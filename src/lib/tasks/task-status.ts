export const TASK_STATUS_VALUES = ['open', 'done', 'not-done'] as const;

export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];

export type TaskStatusOption = {
	value: TaskStatus;
	label: string;
};

export const TASK_STATUS_OPTIONS: readonly TaskStatusOption[] = [
	{ value: 'open', label: 'Open' },
	{ value: 'done', label: 'Done' },
	{ value: 'not-done', label: 'Not Done' }
];

export type TaskDisplayStatus = 'Open' | 'Done' | 'Not Done' | 'Past due';

export function displayTaskStatus(
	dueOn: string,
	status: TaskStatus,
	today: string
): TaskDisplayStatus {
	if (status !== 'done' && dueOn < today) return 'Past due';
	if (status === 'done') return 'Done';
	if (status === 'not-done') return 'Not Done';

	return 'Open';
}

