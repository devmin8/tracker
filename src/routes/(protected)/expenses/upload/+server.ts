import { json } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { importExpenses } from '$lib/server/expenses';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const formData = await request.formData();
	const result = await importExpenses(
		formData.get('file'),
		locals.user.id,
		formData.get('month'),
		db
	);

	if (!result.ok) {
		return json({ message: result.message }, { status: result.status });
	}

	return json({ rowCount: result.rowCount });
};
