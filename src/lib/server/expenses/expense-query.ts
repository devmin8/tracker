import { and, eq } from 'drizzle-orm';

import { descriptionTag, expense, tag } from '$lib/server/db/schema';

export const joinDescriptionTag = and(
	eq(descriptionTag.userId, expense.createdBy),
	eq(descriptionTag.refinedDescription, expense.refinedDescription)
);

export const joinTag = and(eq(tag.userId, expense.createdBy), eq(tag.id, descriptionTag.tagId));

export const listedExpenseColumns = {
	id: expense.id,
	expenseDate: expense.expenseDate,
	amount: expense.amount,
	description: expense.description,
	refinedDescription: expense.refinedDescription,
	comments: expense.comments,
	tagId: descriptionTag.tagId,
	tag: tag.name
};
