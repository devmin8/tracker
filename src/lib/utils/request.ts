import { safeResolve } from './safe-resolve';
import type { SafeTryOk } from './safe-try';

export type RequestError = {
	kind: 'network' | 'http';
	message: string;
	status?: number;
};

export type RequestErr = {
	ok: false;
	result: undefined;
	error: RequestError;
};

export type RequestResult<T> = SafeTryOk<T> | RequestErr;

export async function request<T>(
	input: RequestInfo | URL,
	init?: RequestInit
): Promise<RequestResult<T>> {
	const fetched = await safeResolve(() => fetch(input, init));

	if (!fetched.ok) {
		return {
			ok: false,
			result: undefined,
			error: { kind: 'network', message: 'Check your connection and try again.' }
		};
	}

	const payload = await safeResolve((): Promise<unknown> => fetched.result.json());

	if (!fetched.result.ok) {
		const body = payload.ok ? payload.result : undefined;
		const message =
			typeof body === 'object' &&
			body !== null &&
			'message' in body &&
			typeof body.message === 'string'
				? body.message
				: 'Request failed';

		return {
			ok: false,
			result: undefined,
			error: {
				kind: 'http',
				message,
				status: fetched.result.status
			}
		};
	}

	if (!payload.ok) {
		return {
			ok: false,
			result: undefined,
			error: { kind: 'http', message: 'Request failed', status: fetched.result.status }
		};
	}

	return { ok: true, result: payload.result as T };
}
