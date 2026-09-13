import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { AddExpenseSchema } from '$lib/schemas/add-expense.schema';
import { db } from '$lib/server/db';
import { createExpense } from '$lib/server/expenses';
import { badRequest, protectedApi, readJson, validationError } from '$lib/server/http';

export const POST = protectedApi(async ({ request }, user) => {
	const body = await readJson(request);
	if (!body.ok) {
		return badRequest('Please check the expense details');
	}

	const parsed = v.safeParse(AddExpenseSchema, body.result);
	if (!parsed.success) {
		return validationError(parsed.issues, 'Please check the expense details');
	}

	const result = await createExpense(db, user.id, parsed.output);
	if (!result.ok) {
		return badRequest(result.message);
	}

	return json({ id: result.id });
});
