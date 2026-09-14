import * as v from 'valibot';

import { toCents } from '$lib/utils/amount';
import { formatDateString } from '$lib/utils/date';

function optionalBlank(value: string | undefined) {
	const trimmed = value?.trim() ?? '';
	return trimmed === '' ? undefined : trimmed;
}

export const UpdateExpenseSchema = v.pipe(
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
		comments: v.optional(v.string())
	}),
	v.transform(({ amount, expenseDate, comments }) => ({
		amount,
		expenseDate,
		comments: optionalBlank(comments)
	}))
);

export type UpdateExpenseInput = v.InferOutput<typeof UpdateExpenseSchema>;
