import { and, asc, eq, isNull } from 'drizzle-orm';

import type { Database } from '$lib/server/db/create-db';
import { descriptionTag, expense, tag } from '$lib/server/db/schema';

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

export async function listTagNames(db: Database, userId: string): Promise<string[]> {
	const rows = await db
		.select({ name: tag.name })
		.from(tag)
		.where(eq(tag.userId, userId))
		.orderBy(asc(tag.name));

	return rows.map((row) => row.name);
}

export type UntaggedVisit = {
	expenseDate: string;
	amount: number;
};

export type UntaggedDescription = {
	refinedDescription: string;
	visits: UntaggedVisit[];
};

export async function listUntaggedDescriptions(
	db: Database,
	userId: string
): Promise<UntaggedDescription[]> {
	const rows = await db
		.select({
			refinedDescription: expense.refinedDescription,
			expenseDate: expense.expenseDate,
			amount: expense.amount
		})
		.from(expense)
		.leftJoin(
			descriptionTag,
			and(
				eq(descriptionTag.userId, expense.createdBy),
				eq(descriptionTag.refinedDescription, expense.refinedDescription)
			)
		)
		.where(and(eq(expense.createdBy, userId), isNull(descriptionTag.tagId)))
		.orderBy(asc(expense.refinedDescription), asc(expense.expenseDate));

	const visitsByDescription = new Map<string, UntaggedVisit[]>();
	for (const { refinedDescription, expenseDate, amount } of rows) {
		const visits = visitsByDescription.get(refinedDescription) ?? [];
		visits.push({ expenseDate, amount });
		visitsByDescription.set(refinedDescription, visits);
	}

	return [...visitsByDescription].map(([refinedDescription, visits]) => ({
		refinedDescription,
		visits
	}));
}
