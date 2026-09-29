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

export function parseTasksPage(value: string | null | undefined): number {
	const page = Number(value);

	return Number.isInteger(page) && page >= 1 ? page : 1;
}

export function clampTasksPage(page: number, total: number, pageSize: number): number {
	const pageCount = Math.max(1, Math.ceil(total / pageSize));

	return Math.min(Math.max(page, 1), pageCount);
}
