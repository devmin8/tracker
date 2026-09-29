import { and, asc, count, desc, eq, or } from 'drizzle-orm';

import type { CreateTaskInput } from '$lib/schemas/create-task.schema';
import type { UpdateTaskInput } from '$lib/schemas/update-task.schema';
import type { Database } from '$lib/server/db/create-db';
import {
	auditTrail,
	task,
	user,
	type AuditTrailInsert,
	type TaskInsert
} from '$lib/server/db/schema';
import { userExists } from '$lib/server/users';
import type { TaskItem } from '$lib/tasks/task-item';
import type { TaskFilter } from '$lib/tasks/task-list';
import { todayIsoDate } from '$lib/utils/date';

export const TASKS_PAGE_SIZE = 50;

export type ListedTask = TaskItem;

export type ListTasksResult = {
	tasks: ListedTask[];
	total: number;
};

export type ListTasksInput = {
	limit: number;
	offset: number;
};

export async function listTasks(
	db: Database,
	userId: string,
	filter: TaskFilter,
	{ limit, offset }: ListTasksInput
): Promise<ListTasksResult> {
	const where = whereAccessibleTasks(userId, filter);

	const [tasks, [totalRow]] = await Promise.all([
		db
			.select({
				id: task.id,
				name: task.name,
				dueOn: task.dueOn,
				status: task.status,
				assignedTo: task.assignedTo,
				finishedAt: task.finishedAt,
				assigneeName: user.name
			})
			.from(task)
			.leftJoin(user, eq(task.assignedTo, user.id))
			.where(where)
			.orderBy(asc(task.dueOn), desc(task.createdAt))
			.limit(limit)
			.offset(offset),
		db.select({ total: count() }).from(task).where(where)
	]);

	return { tasks, total: totalRow?.total ?? 0 };
}

export type TaskWriteResult = { ok: true; id: string } | { ok: false; message: string };

export async function createTask(
	db: Database,
	userId: string,
	input: CreateTaskInput
): Promise<TaskWriteResult> {
	if (!(await userExists(db, input.assignedTo))) {
		return { ok: false, message: 'Select a valid assignee' };
	}

	const created = await db.transaction(async (tx) => {
		const [row] = await tx
			.insert(task)
			.values({
				name: input.name,
				dueOn: input.dueOn,
				status: input.status,
				finishedAt: input.status === 'done' ? todayIsoDate() : null,
				createdBy: userId,
				assignedTo: input.assignedTo,
				updatedBy: userId
			} satisfies TaskInsert)
			.returning({ id: task.id });

		if (!row) throw new Error('Task insert did not return an id');

		await tx.insert(auditTrail).values(taskAudit('add task', input.name, userId, row.id));

		return row;
	});

	return { ok: true, id: created.id };
}

export async function updateTask(
	db: Database,
	userId: string,
	taskId: string,
	input: UpdateTaskInput
): Promise<TaskWriteResult> {
	if (!(await userExists(db, input.assignedTo))) {
		return { ok: false, message: 'Select a valid assignee' };
	}

	const updated = await db.transaction(async (tx) => {
		const [existing] = await tx
			.select({ id: task.id, status: task.status, finishedAt: task.finishedAt })
			.from(task)
			.where(whereAccessibleTask(userId, taskId));

		if (!existing) return undefined;

		const finishedAt =
			input.status === 'done' ? (input.finishedAt ?? existing.finishedAt ?? todayIsoDate()) : null;

		const [row] = await tx
			.update(task)
			.set({
				name: input.name,
				dueOn: input.dueOn,
				status: input.status,
				finishedAt,
				assignedTo: input.assignedTo,
				updatedBy: userId
			})
			.where(whereAccessibleTask(userId, taskId))
			.returning({ id: task.id });

		if (!row) return undefined;

		if (existing.status !== input.status) {
			await tx.insert(auditTrail).values(taskAudit('update status', input.status, userId, row.id));
		}

		return row;
	});

	if (!updated) {
		return { ok: false, message: 'Task not found' };
	}

	return { ok: true, id: updated.id };
}

export async function deleteTask(
	db: Database,
	userId: string,
	taskId: string
): Promise<TaskWriteResult> {
	const deleted = await db.transaction(async (tx) => {
		const [existing] = await tx
			.select({ id: task.id, name: task.name })
			.from(task)
			.where(whereAccessibleTask(userId, taskId));

		if (!existing) return undefined;

		const [row] = await tx
			.update(task)
			.set({ isArchived: true, updatedBy: userId })
			.where(whereAccessibleTask(userId, taskId))
			.returning({ id: task.id });

		if (!row) return undefined;

		await tx.insert(auditTrail).values(taskAudit('delete task', existing.name, userId, row.id));

		return row;
	});

	if (!deleted) {
		return { ok: false, message: 'Task not found' };
	}

	return { ok: true, id: deleted.id };
}

function taskAudit(
	action: AuditTrailInsert['action'],
	value: string,
	userId: string,
	entityId: string
): AuditTrailInsert {
	return { entityType: 'task', action, value, userId, entityId };
}

function whereAccessibleTasks(userId: string, filter: TaskFilter) {
	const byStatus = filter === 'all' ? undefined : eq(task.status, filter);

	return and(whereAccessibleTaskConditions(userId), byStatus);
}

function whereAccessibleTask(userId: string, taskId: string) {
	return and(whereAccessibleTaskConditions(userId), eq(task.id, taskId));
}

function whereAccessibleTaskConditions(userId: string) {
	return and(
		or(eq(task.createdBy, userId), eq(task.assignedTo, userId)),
		eq(task.isArchived, false)
	);
}
