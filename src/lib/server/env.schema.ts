import * as v from 'valibot';

export const EnvSchema = v.object({
	DATABASE_URL: v.pipe(v.string(), v.nonEmpty('DB Url is required'))
});

export type EnvData = v.InferOutput<typeof EnvSchema>;

export function getEnvData(env: NodeJS.ProcessEnv = process.env) {
	return v.parse(EnvSchema, env);
}
