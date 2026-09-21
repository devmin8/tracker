import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

export function loadEnvFileIfExists() {
	if (existsSync('.env')) {
		loadEnvFile();
	}
}
