import { json } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { protectedApi } from '$lib/server/http';
import { listUntaggedDescriptions } from '$lib/server/tags';

export const GET = protectedApi(async (_event, user) => {
	const descriptions = await listUntaggedDescriptions(db, user.id);
	return json({ descriptions });
});
