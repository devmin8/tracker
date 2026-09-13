import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { UpdateTagsSchema } from '$lib/components/tags/update-tags-form.schema';
import { db } from '$lib/server/db';
import { badRequest, protectedApi, readJson, validationError } from '$lib/server/http';
import { updateTags } from '$lib/server/tags';

export const POST = protectedApi(async ({ request }, user) => {
	const body = await readJson(request);
	if (!body.ok) {
		return badRequest('Please check the tag details');
	}

	const parsed = v.safeParse(UpdateTagsSchema, body.result);
	if (!parsed.success) {
		return validationError(parsed.issues, 'Please check the tag details');
	}

	const tagId = await updateTags(db, user.id, parsed.output);
	return json({ tagId });
});
