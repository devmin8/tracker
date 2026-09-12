import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { listMonthExpenses } from '$lib/server/expenses';
import { resolveYearMonth } from '$lib/utils/date';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const month = resolveYearMonth(url.searchParams.get('month'));
	const expenses = await listMonthExpenses(db, locals.user.id, month);

	return { month, expenses };
};
