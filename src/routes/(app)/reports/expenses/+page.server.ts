import { parseExpenseReportQuery } from '$lib/expenses';
import { db } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/http';
import { getExpenseReport } from '$lib/server/expenses';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireAuthenticatedUser(locals.user, url);
	const query = parseExpenseReportQuery(url.searchParams);

	return getExpenseReport(db, user.id, query);
};
