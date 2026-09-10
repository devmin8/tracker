import { json } from '@sveltejs/kit';

import { importExpensesFromCsv } from '$lib/server/expenses';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const file = (await request.formData()).get('file');
	const result = await importExpensesFromCsv(file, locals.user.id);

	if (!result.ok) {
		return json({ message: result.message }, { status: result.status });
	}

	return json({ rowCount: result.rowCount });
};
