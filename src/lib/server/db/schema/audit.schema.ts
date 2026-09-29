import { sql, type InferInsertModel } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { user } from './auth.schema';

export type AuditEntityType = 'task';

export type AuditAction = 'add task' | 'update status' | 'delete task';

export const auditTrail = sqliteTable(
	'audit_trail',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		entityType: text('entity_type').$type<AuditEntityType>().notNull(),
		action: text('action').$type<AuditAction>().notNull(),
		value: text('value'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		entityId: text('entity_id').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [
		index('audit_trail_entity_idx').on(table.entityType, table.entityId),
		index('audit_trail_user_idx').on(table.userId)
	]
);

export type AuditTrailInsert = InferInsertModel<typeof auditTrail>;
