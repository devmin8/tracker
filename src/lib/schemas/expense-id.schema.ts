import * as v from 'valibot';

export const ExpenseIdSchema = v.pipe(v.string(), v.trim(), v.nonEmpty('Expense not found'));

export type ExpenseId = v.InferOutput<typeof ExpenseIdSchema>;
