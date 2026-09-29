import { db } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/http';
import { listTasks, TASKS_PAGE_SIZE } from '$lib/server/tasks';
import { listUsers } from '$lib/server/users';
import { clampTasksPage, parseTaskFilter, parseTasksPage } from '$lib/tasks/task-list';
import { todayIsoDate } from '$lib/utils/date';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireAuthenticatedUser(locals.user);
	const status = parseTaskFilter(url.searchParams.get('status'));
	const requestedPage = parseTasksPage(url.searchParams.get('page'));
	const today = todayIsoDate();

	const [first, assignees] = await Promise.all([
		listTasks(db, user.id, status, {
			limit: TASKS_PAGE_SIZE,
			offset: (requestedPage - 1) * TASKS_PAGE_SIZE
		}),
		listUsers(db)
	]);
	const page = clampTasksPage(requestedPage, first.total, TASKS_PAGE_SIZE);

	const tasks =
		page === requestedPage
			? first.tasks
			: (
					await listTasks(db, user.id, status, {
						limit: TASKS_PAGE_SIZE,
						offset: (page - 1) * TASKS_PAGE_SIZE
					})
				).tasks;

	return {
		status,
		page,
		pageSize: TASKS_PAGE_SIZE,
		total: first.total,
		pageCount: Math.max(1, Math.ceil(first.total / TASKS_PAGE_SIZE)),
		today,
		tasks,
		assignees,
		currentUserId: user.id
	};
};
