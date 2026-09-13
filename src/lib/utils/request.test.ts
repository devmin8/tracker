import { afterEach, describe, expect, test, vi } from 'vitest';

import { request } from './request';

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

describe('request', () => {
	test('returns the parsed body when the response is ok', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ tagId: 7 })));

		await expect(request('/expenses/tags', { method: 'POST' })).resolves.toEqual({
			ok: true,
			result: { tagId: 7 }
		});
	});

	test('returns a network error when fetch rejects', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

		const outcome = await request('/expenses/tags');

		expect(outcome).toEqual({
			ok: false,
			result: undefined,
			error: { kind: 'network', message: 'Check your connection and try again.' }
		});
	});

	test('returns the server message when the response is not ok', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(jsonResponse({ message: 'Tag already exists' }, 400))
		);

		const outcome = await request('/expenses/tags');

		expect(outcome).toEqual({
			ok: false,
			result: undefined,
			error: { kind: 'http', message: 'Tag already exists', status: 400 }
		});
	});

	test('returns a fallback when an error body has no message', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 500)));

		const outcome = await request('/expenses/tags');

		expect(outcome).toEqual({
			ok: false,
			result: undefined,
			error: { kind: 'http', message: 'Request failed', status: 500 }
		});
	});

	test('returns a fallback when an ok body is not JSON', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not-json', { status: 200 })));

		const outcome = await request('/expenses/tags');

		expect(outcome).toEqual({
			ok: false,
			result: undefined,
			error: { kind: 'http', message: 'Request failed', status: 200 }
		});
	});
});
