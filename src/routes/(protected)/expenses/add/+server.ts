import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { AddExpenseInputSchema } from '$lib/components/expenses/add-expense-form.schema';
import { db } from '$lib/server/db';
import { createExpense } from '$lib/server/expenses';
import { safeResolve } from '$lib/utils/safe-resolve';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const body = await safeResolve(() => request.json());
	if (!body.ok) {
		return json({ message: 'Please check the expense details' }, { status: 400 });
	}

	const parsed = v.safeParse(AddExpenseInputSchema, body.result);
	if (!parsed.success) {
		return json(
			{ message: parsed.issues[0]?.message ?? 'Please check the expense details' },
			{ status: 400 }
		);
	}

	const result = await createExpense(db, locals.user.id, parsed.output);
	if (!result.ok) {
		return json({ message: result.message }, { status: 400 });
	}

	return json({ id: result.id });
};
