import { defineRelations } from 'drizzle-orm';

import { account, session, user, verification } from './auth.schema';
import { auditTrail } from './audit.schema';
import { expense } from './expense.schema';
import { task } from './task.schema';

export const relations = defineRelations(
	{ user, session, account, verification, expense, task, auditTrail },
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
			}),
			createdTasks: r.many.task({
				from: r.user.id,
				to: r.task.createdBy,
				alias: 'createdBy'
			}),
			updatedTasks: r.many.task({
				from: r.user.id,
				to: r.task.updatedBy,
				alias: 'updatedBy'
			}),
			assignedTasks: r.many.task({
				from: r.user.id,
				to: r.task.assignedTo,
				alias: 'assignedTo'
			}),
			auditEntries: r.many.auditTrail({
				from: r.user.id,
				to: r.auditTrail.userId
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
		},
		task: {
			createdByUser: r.one.user({
				from: r.task.createdBy,
				to: r.user.id,
				optional: false,
				alias: 'createdBy'
			}),
			updatedByUser: r.one.user({
				from: r.task.updatedBy,
				to: r.user.id,
				optional: false,
				alias: 'updatedBy'
			}),
			assignedToUser: r.one.user({
				from: r.task.assignedTo,
				to: r.user.id,
				optional: false,
				alias: 'assignedTo'
			})
		},
		auditTrail: {
			user: r.one.user({
				from: r.auditTrail.userId,
				to: r.user.id,
				optional: false
			})
		}
	})
);
