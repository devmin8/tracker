import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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
	(table) => [index('expense_created_by_expense_date_idx').on(table.createdBy, table.expenseDate)]
);
