import { db } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/http';
import { listTags } from '$lib/server/tags';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = requireAuthenticatedUser(locals.user);
	const tags = await listTags(db, user.id);
	return { tags };
};
