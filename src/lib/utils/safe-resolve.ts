import type { SafeTryErr, SafeTryOk, SafeTryResult } from './safe-try';

export async function safeResolve<T>(fn: () => Promise<T>): Promise<SafeTryResult<T>> {
	try {
		const result = await fn();
		return { ok: true, result } satisfies SafeTryOk<T>;
	} catch (error) {
		return { ok: false, result: undefined, error } satisfies SafeTryErr;
	}
}
