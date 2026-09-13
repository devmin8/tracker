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

type ErrorPayload = {
	message?: string;
};

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

	const payload = await safeResolve(() => fetched.result.json() as Promise<T & ErrorPayload>);

	if (!fetched.result.ok) {
		return {
			ok: false,
			result: undefined,
			error: {
				kind: 'http',
				message: (payload.ok ? payload.result.message : undefined) ?? 'Request failed',
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

	return { ok: true, result: payload.result };
}
