import type { TaskStatus } from './task-status';

export type TaskItem = {
	id: string;
	name: string;
	dueOn: string;
	status: TaskStatus;
	assignedTo: string;
	finishedAt: string | null;
	assigneeName: string | null;
};

export type EditableTask = Pick<
	TaskItem,
	'id' | 'name' | 'dueOn' | 'status' | 'assignedTo' | 'finishedAt'
>;

export type DeletableTask = Pick<TaskItem, 'id' | 'name' | 'dueOn'>;
