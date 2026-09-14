import type { Database } from '$lib/server/db/create-db';
import { descriptionTag, tag } from '$lib/server/db/schema';

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
type UpdateTagsInput = {
	name: string;
	nameKey: string;
	refinedDescription: string;
};

export async function assignDescriptionTag(
	tx: Transaction,
	userId: string,
	refinedDescription: string,
	tagId: string
) {
	await tx
		.insert(descriptionTag)
		.values({ userId, refinedDescription, tagId })
		.onConflictDoUpdate({
			target: [descriptionTag.userId, descriptionTag.refinedDescription],
			set: { tagId }
		});
}

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

		await assignDescriptionTag(tx, userId, input.refinedDescription, savedTag.id);

		return savedTag.id;
	});

	return tagId;
}
