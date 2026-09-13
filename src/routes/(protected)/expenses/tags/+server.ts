import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { UpdateTagsSchema } from '$lib/components/tags/update-tags-form.schema';
import { db } from '$lib/server/db';
import { updateTags } from '$lib/server/tags';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const formData = await request.formData();
	const parsed = v.safeParse(UpdateTagsSchema, Object.fromEntries(formData));

	if (!parsed.success) {
		return json(
			{ message: parsed.issues[0]?.message ?? 'Please check the tag details' },
			{ status: 400 }
		);
	}

	const tagId = await updateTags(db, locals.user.id, parsed.output);
	return json({ tagId });
};
