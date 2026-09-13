import * as v from 'valibot';

import { formatDateString } from '$lib/utils/date';

export const AddExpenseInputSchema = v.object({
	amount: v.pipe(v.number(), v.integer('Amount must be in cents')),
	expenseDate: v.pipe(
		v.string(),
		v.check((value) => formatDateString(value) === value, 'Enter a valid date')
	),
	description: v.pipe(v.string(), v.trim(), v.nonEmpty('Description is required')),
	refinedDescription: v.pipe(v.string(), v.trim(), v.nonEmpty('Description is required')),
	tagId: v.optional(v.pipe(v.string(), v.nonEmpty())),
	comments: v.optional(v.pipe(v.string(), v.nonEmpty()))
});

export type AddExpenseInput = v.InferOutput<typeof AddExpenseInputSchema>;
