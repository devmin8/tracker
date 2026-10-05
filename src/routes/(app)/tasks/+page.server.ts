import { db } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/http';
import { listTasks } from '$lib/server/tasks';
import { listUsers } from '$lib/server/users';
import { parseTaskFilter } from '$lib/tasks/task-list';
import { todayIsoDate } from '$lib/utils/date';
import { parsePage } from '$lib/utils/pagination';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireAuthenticatedUser(locals.user, url);
	const status = parseTaskFilter(url.searchParams.get('status'));
	const requestedPage = parsePage(url.searchParams.get('page'));
	const today = todayIsoDate();

	const [{ tasks, pagination }, assignees] = await Promise.all([
		listTasks(db, user.id, status, requestedPage),
		listUsers(db)
	]);

	return {
		status,
		pagination,
		today,
		tasks,
		assignees,
		currentUserId: user.id
	};
};
