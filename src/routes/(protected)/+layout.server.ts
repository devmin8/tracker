import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { listTags } from '$lib/server/tags';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const tags = await listTags(db, locals.user.id);
	return { tags };
};
