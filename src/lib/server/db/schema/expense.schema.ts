import { sql } from 'drizzle-orm';
import {
	foreignKey,
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	unique
} from 'drizzle-orm/sqlite-core';

import { user } from './auth.schema';

export const expense = sqliteTable(
	'expense',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		expenseDate: text('expense_date').notNull(),
		importedAt: integer('imported_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		// lets store in cents
		amount: integer('amount').notNull(),
		description: text('description').notNull(),
		refinedDescription: text('refined_description').notNull(),
		comments: text('comments'),
		createdBy: text('created_by')
			.notNull()
			.references(() => user.id),
		updatedBy: text('updated_by')
			.notNull()
			.references(() => user.id)
	},
	(table) => [index('expense_created_by_expense_date_idx').on(table.createdBy, table.expenseDate)]
);

export const tag = sqliteTable(
	'tag',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		name: text('name').notNull(),
		nameKey: text('name_key').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [
		unique().on(table.userId, table.nameKey),
		unique().on(table.userId, table.id),
		index('tag_user_id_name_idx').on(table.userId, table.name)
	]
);

export const descriptionTag = sqliteTable(
	'description_tag',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		refinedDescription: text('refined_description').notNull(),
		tagId: text('tag_id').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.refinedDescription] }),
		foreignKey({
			columns: [table.userId, table.tagId],
			foreignColumns: [tag.userId, tag.id]
		}),
		index('description_tag_user_id_tag_id_refined_description_idx').on(
			table.userId,
			table.tagId,
			table.refinedDescription
		)
	]
);
