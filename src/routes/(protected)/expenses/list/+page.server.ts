import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { listMonthExpenses } from '$lib/server/expenses';
import { resolveCalendarMonth } from '$lib/utils/date';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const month = resolveCalendarMonth(url.searchParams.get('month') ?? undefined);
	const expenses = await listMonthExpenses(db, locals.user.id, month);

	return { month, expenses };
};
