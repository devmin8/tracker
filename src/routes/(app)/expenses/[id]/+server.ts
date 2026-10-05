import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { UpdateExpenseSchema } from '$lib/schemas/update-expense.schema';
import { db } from '$lib/server/db';
import { deleteExpense, updateExpense } from '$lib/server/expenses';
import { apiError, badRequest, protectedApi, readJson, validationError } from '$lib/server/http';

export const PUT = protectedApi(async ({ params, request }, user) => {
	const expenseId = params.id;
	if (!expenseId) return apiError(404, 'Expense not found');

	const body = await readJson(request);
	if (!body.ok) {
		return badRequest('Please check the expense details');
	}

	const parsed = v.safeParse(UpdateExpenseSchema, body.result);
	if (!parsed.success) {
		return validationError(parsed.issues, 'Please check the expense details');
	}

	const result = await updateExpense(db, user.id, expenseId, parsed.output);
	if (!result.ok) {
		return result.message === 'Expense not found'
			? apiError(404, result.message)
			: badRequest(result.message);
	}

	return json({ id: result.id });
});

export const DELETE = protectedApi(async ({ params }, user) => {
	const expenseId = params.id;
	if (!expenseId) return apiError(404, 'Expense not found');

	const result = await deleteExpense(db, user.id, expenseId);
	if (!result.ok) {
		return apiError(404, result.message);
	}

	return json({ id: result.id });
});
