import * as v from 'valibot';

export const UpdateTagsSchema = v.pipe(
	v.object({
		name: v.pipe(
			v.string(),
			v.trim(),
			v.transform((value) => value.replace(/\s+/g, ' ')),
			v.nonEmpty('Tag name is required'),
			v.maxLength(50, 'Tag name must be 50 characters or fewer')
		),
		refinedDescription: v.pipe(v.string(), v.trim(), v.nonEmpty('Expense is required'))
	}),
	v.transform(({ name, refinedDescription }) => ({
		name,
		nameKey: name.toLowerCase(),
		refinedDescription
	}))
);

export type UpdateTagsInput = v.InferOutput<typeof UpdateTagsSchema>;
