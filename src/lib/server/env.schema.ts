import * as v from 'valibot';

export const EnvSchema = v.object({
	DATABASE_URL: v.pipe(v.string(), v.nonEmpty('DB Url is required')),
	BETTER_AUTH_SECRET: v.pipe(v.string(), v.nonEmpty('Better Auth secret is required')),
	BETTER_AUTH_URL: v.pipe(
		v.string(),
		v.nonEmpty('Better Auth URL is required'),
		v.url('Better Auth URL must be a valid URL')
	)
});

export type EnvData = v.InferOutput<typeof EnvSchema>;

export function getEnvData(env: NodeJS.ProcessEnv = process.env) {
	return v.parse(EnvSchema, env);
}
