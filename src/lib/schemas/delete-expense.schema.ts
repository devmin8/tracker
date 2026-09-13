import * as v from 'valibot';

export const DeleteExpenseSchema = v.pipe(v.string(), v.trim(), v.nonEmpty('Expense not found'));

export type DeleteExpenseId = v.InferOutput<typeof DeleteExpenseSchema>;
