import { db } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/http';
import { listMonthExpenses } from '$lib/server/expenses';
import { resolveYearMonth } from '$lib/utils/date';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireAuthenticatedUser(locals.user);
	const month = resolveYearMonth(url.searchParams.get('month'));
	const expenses = await listMonthExpenses(db, user.id, month);

	return { month, expenses };
};
