import { json } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { importExpenses } from '$lib/server/expenses';
import { formatYearMonth, parseYearMonth, type YearMonth } from '$lib/utils/date';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const form = readImportForm(await request.formData());
	if (!form.ok) {
		return json({ message: form.message }, { status: 400 });
	}

	const result = await importExpenses(db, locals.user.id, form.file, form.month);
	if (!result.ok) {
		return json({ message: result.message }, { status: 400 });
	}

	return json({ rowCount: result.rowCount });
};

type ImportForm = { ok: true; file: File; month: YearMonth } | { ok: false; message: string };

function readImportForm(formData: FormData): ImportForm {
	const file = formData.get('file');
	if (!(file instanceof File)) {
		return { ok: false, message: 'A CSV file is required' };
	}

	const monthValue = formData.get('month');
	if (typeof monthValue !== 'string' || monthValue.trim() === '') {
		return { ok: false, message: 'A month is required' };
	}

	const parsed = parseYearMonth(monthValue);
	if (!parsed) {
		return { ok: false, message: 'Month must be YYYY-MM' };
	}

	return { ok: true, file, month: formatYearMonth(parsed) };
}
