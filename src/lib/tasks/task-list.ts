import { TASK_STATUS_VALUES, type TaskStatus } from './task-status';

export type TaskFilter = TaskStatus | 'all';

export type TaskFilterOption = {
	value: TaskFilter;
	label: string;
};

export const TASK_FILTER_OPTIONS: readonly TaskFilterOption[] = [
	{ value: 'all', label: 'All' },
	{ value: 'open', label: 'Open' },
	{ value: 'done', label: 'Done' },
	{ value: 'not-done', label: 'Not Done' }
];

const TASK_FILTERS: readonly TaskFilter[] = ['all', ...TASK_STATUS_VALUES];

export function parseTaskFilter(value: string | null | undefined): TaskFilter {
	const normalized = value?.trim().toLowerCase();
	if (normalized && (TASK_FILTERS as readonly string[]).includes(normalized)) {
		return normalized as TaskFilter;
	}

	return 'all';
}
