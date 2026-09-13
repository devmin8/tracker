import * as v from 'valibot';

import { toCents } from '$lib/utils/amount';
import { formatDateString } from '$lib/utils/date';

export type ExpenseTagOption = {
	id: string;
	name: string;
};

export type AddExpenseInput = {
	amount: number;
	expenseDate: string;
	description: string;
	refinedDescription: string;
	tagId?: string;
	comments?: string;
};

function optionalBlank(value: string | undefined) {
	const trimmed = value?.trim() ?? '';
	return trimmed === '' ? undefined : trimmed;
}

export const AddExpenseFormSchema = v.pipe(
	v.object({
		amount: v.pipe(
			v.string(),
			v.trim(),
			v.nonEmpty('Amount is required'),
			v.check((value) => toCents(value) !== null, 'Enter a valid amount'),
			v.transform((value) => toCents(value) as number)
		),
		expenseDate: v.pipe(
			v.string(),
			v.trim(),
			v.nonEmpty('Date is required'),
			v.check((value) => formatDateString(value) !== null, 'Enter a valid date'),
			v.transform((value) => formatDateString(value) as string)
		),
		description: v.pipe(
			v.string(),
			v.trim(),
			v.transform((value) => value.replace(/\s+/g, ' ')),
			v.nonEmpty('Description is required')
		),
		tagId: v.optional(v.string()),
		comments: v.optional(v.string())
	}),
	v.transform(({ amount, expenseDate, description, tagId, comments }) => ({
		amount,
		expenseDate,
		description,
		refinedDescription: description,
		tagId: optionalBlank(tagId),
		comments: optionalBlank(comments)
	}))
);

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
