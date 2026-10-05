import { db } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/http';
import { getYearlyReport } from '$lib/server/expenses';
import { resolveYear } from '$lib/utils/date';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireAuthenticatedUser(locals.user, url);
	const year = resolveYear(url.searchParams.get('year'));

	return getYearlyReport(db, user.id, year);
};
