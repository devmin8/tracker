import * as v from 'valibot';

export const LoginSchema = v.object({
	email: v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty('Email is required'),
		v.email('Enter a valid email address')
	),
	password: v.pipe(
		v.string(),
		v.nonEmpty('Password is required'),
		v.maxLength(90, 'Password must be 90 characters or fewer')
	)
});

export type LoginInput = v.InferOutput<typeof LoginSchema>;
