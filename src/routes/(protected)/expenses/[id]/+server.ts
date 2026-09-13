import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { DeleteExpenseSchema } from '$lib/schemas/delete-expense.schema';
import { db } from '$lib/server/db';
import { deleteExpense } from '$lib/server/expenses';
import { apiError, protectedApi, validationError } from '$lib/server/http';

export const DELETE = protectedApi(async ({ params }, user) => {
	const parsed = v.safeParse(DeleteExpenseSchema, params.id);
	if (!parsed.success) {
		return validationError(parsed.issues, 'Expense not found');
	}

	const result = await deleteExpense(db, user.id, parsed.output);
	if (!result.ok) {
		return apiError(404, result.message);
	}

	return json({ id: result.id });
});
