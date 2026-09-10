import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { user } from './auth.schema';

export const expense = sqliteTable(
	'expense',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		date: integer('date', { mode: 'timestamp_ms' }).notNull(),
		// lets store in cents
		amount: integer('amount').notNull(),
		description: text('description').notNull(),
		refinedDescription: text('refined_description'),
		comments: text('comments'),
		tag: text('tag'),
		createdBy: text('created_by')
			.notNull()
			.references(() => user.id),
		updatedBy: text('updated_by')
			.notNull()
			.references(() => user.id)
	},
	(table) => [
		index('expense_date_idx').on(table.date),
		index('expense_createdBy_idx').on(table.createdBy)
	]
);
