import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { ImportTransactionsSchema } from '$lib/schemas/import-transactions.schema';
import { db } from '$lib/server/db';
import { importTransactions } from '$lib/server/expenses';
import { badRequest, protectedApi, readFormData, validationError } from '$lib/server/http';

export const POST = protectedApi(async ({ request }, user) => {
	const formData = await readFormData(request);
	if (!formData.ok) {
		return badRequest('Please check the import details');
	}

	const form = v.safeParse(ImportTransactionsSchema, {
		files: formData.result.getAll('files'),
		month: formData.result.get('month')
	});
	if (!form.success) {
		return validationError(form.issues, 'Please check the import details');
	}

	const result = await importTransactions(db, user.id, form.output.files, form.output.month);
	if (!result.ok) {
		return badRequest(result.message);
	}

	return json({ rowCount: result.rowCount });
});
