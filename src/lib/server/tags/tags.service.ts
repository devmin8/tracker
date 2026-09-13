import type { UpdateTagsInput } from '$lib/components/tags/update-tags-form.schema';
import type { Database } from '$lib/server/db/create-db';
import { descriptionTag, tag } from '$lib/server/db/schema';

export async function updateTags(
	db: Database,
	userId: string,
	input: UpdateTagsInput
): Promise<string> {
	const tagId = await db.transaction(async (tx) => {
		const [savedTag] = await tx
			.insert(tag)
			.values({ userId, name: input.name, nameKey: input.nameKey })
			.onConflictDoUpdate({
				target: [tag.userId, tag.nameKey],
				set: { name: input.name }
			})
			.returning({ id: tag.id });

		if (!savedTag) throw new Error('Tag upsert did not return an id');

		await tx
			.insert(descriptionTag)
			.values({
				userId,
				refinedDescription: input.refinedDescription,
				tagId: savedTag.id
			})
			.onConflictDoUpdate({
				target: [descriptionTag.userId, descriptionTag.refinedDescription],
				set: { tagId: savedTag.id }
			});

		return savedTag.id;
	});

	return tagId;
}
