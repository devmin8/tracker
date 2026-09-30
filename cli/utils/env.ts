import { getEnvData } from '$lib/server/env.schema';
import { loadEnvFileIfExists } from '$lib/server/load-env';

export function loadCliEnv() {
	loadEnvFileIfExists();
	return getEnvData();
}
