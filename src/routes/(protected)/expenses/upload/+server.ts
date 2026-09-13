import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { db } from '$lib/server/db';
import { importExpenses } from '$lib/server/expenses';
import { ImportExpensesFormSchema } from '$lib/server/expenses/import-expenses-form.schema';
import { badRequest, protectedApi, readFormData, validationError } from '$lib/server/http';

export const POST = protectedApi(async ({ request }, user) => {
	const formData = await readFormData(request);
	if (!formData.ok) {
		return badRequest('Please check the import details');
	}

	const form = v.safeParse(ImportExpensesFormSchema, Object.fromEntries(formData.result));
	if (!form.success) {
		return validationError(form.issues, 'Please check the import details');
	}

	const result = await importExpenses(db, user.id, form.output.file, form.output.month);
	if (!result.ok) {
		return badRequest(result.message);
	}

	return json({ rowCount: result.rowCount });
});
