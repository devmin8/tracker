import { asc, eq } from 'drizzle-orm';

import type { Database } from '$lib/server/db/create-db';
import { user } from '$lib/server/db/schema';
import type { TaskAssignee } from '$lib/tasks/assignee';

export async function listUsers(db: Database): Promise<TaskAssignee[]> {
	return db
		.select({ id: user.id, name: user.name, email: user.email })
		.from(user)
		.orderBy(asc(user.name));
}

export async function userExists(db: Database, userId: string): Promise<boolean> {
	const [row] = await db.select({ id: user.id }).from(user).where(eq(user.id, userId));

	return row !== undefined;
}
