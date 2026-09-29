import { sql, type InferInsertModel } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { TaskStatus } from '$lib/tasks/task-status';

import { user } from './auth.schema';

export const task = sqliteTable(
	'task',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: text('name').notNull(),
		dueOn: text('due_on').notNull(),
		status: text('status').$type<TaskStatus>().notNull().default('open'),
		finishedAt: text('finished_at'),
		createdBy: text('created_by')
			.notNull()
			.references(() => user.id),
		assignedTo: text('assigned_to')
			.notNull()
			.references(() => user.id),
		updatedBy: text('updated_by')
			.notNull()
			.references(() => user.id),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		isArchived: integer('is_archived', { mode: 'boolean' }).default(false).notNull()
	},
	(	table) => [
		index('task_created_by_due_on_idx').on(table.createdBy, table.dueOn),
		index('task_assigned_to_due_on_idx').on(table.assignedTo, table.dueOn),
		index('task_status_due_on_idx').on(table.status, table.dueOn)
	]
);

export type TaskInsert = InferInsertModel<typeof task>;
