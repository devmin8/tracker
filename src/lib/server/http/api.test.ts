import { error, isHttpError, isRedirect, json, redirect, type RequestEvent } from '@sveltejs/kit';
import { describe, expect, test, vi } from 'vitest';

import { protectedApi } from './api';

const user = { id: 'user-1' } as NonNullable<App.Locals['user']>;

describe('protectedApi', () => {
	test('returns 401 when unauthenticated', async () => {
		const handle = protectedApi(async () => json({ ok: true }));
		const response = await handle(event(undefined));

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ message: 'Unauthorized' });
	});

	test('returns the handler response when authenticated', async () => {
		const handle = protectedApi(async () => json({ id: 'exp-1' }));
		const response = await handle(event(user));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ id: 'exp-1' });
	});

	test('rethrows SvelteKit error() and redirect()', async () => {
		const forbidden = protectedApi(async () => {
			error(403, 'Nope');
		});
		await expect(forbidden(event(user))).rejects.toSatisfy(isHttpError);

		const sendAway = protectedApi(async () => {
			redirect(303, '/login');
		});
		await expect(sendAway(event(user))).rejects.toSatisfy(isRedirect);
	});

	test('returns 500 for unexpected throws', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});

		const handle = protectedApi(async () => {
			throw new Error('boom');
		});
		const response = await handle(event(user));

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			message: 'Something went wrong. Please try again.'
		});

		vi.restoreAllMocks();
	});
});

function event(currentUser: App.Locals['user']): RequestEvent {
	return { locals: { user: currentUser } } as RequestEvent;
}
