import { getDashboard } from '$lib/server/dashboard';
import { db } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/http';
import { resolveYearMonth } from '$lib/utils/date';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireAuthenticatedUser(locals.user);
	const month = resolveYearMonth(url.searchParams.get('month'));

	return getDashboard(db, user.id, month);
};
