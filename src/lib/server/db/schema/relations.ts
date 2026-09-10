import { defineRelations } from 'drizzle-orm';

import { account, session, user, verification } from './auth.schema';
import { expense } from './expense.schema';

export const relations = defineRelations(
	{ user, session, account, verification, expense },
	(r) => ({
		user: {
			sessions: r.many.session(),
			accounts: r.many.account(),
			createdExpenses: r.many.expense({
				from: r.user.id,
				to: r.expense.createdBy,
				alias: 'createdBy'
			}),
			updatedExpenses: r.many.expense({
				from: r.user.id,
				to: r.expense.updatedBy,
				alias: 'updatedBy'
			})
		},
		session: {
			user: r.one.user({
				from: r.session.userId,
				to: r.user.id
			})
		},
		account: {
			user: r.one.user({
				from: r.account.userId,
				to: r.user.id
			})
		},
		expense: {
			createdByUser: r.one.user({
				from: r.expense.createdBy,
				to: r.user.id,
				optional: false,
				alias: 'createdBy'
			}),
			updatedByUser: r.one.user({
				from: r.expense.updatedBy,
				to: r.user.id,
				optional: false,
				alias: 'updatedBy'
			})
		}
	})
);
