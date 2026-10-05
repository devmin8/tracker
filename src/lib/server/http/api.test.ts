import { error, isHttpError, isRedirect, json, redirect, type RequestEvent } from '@sveltejs/kit';
import { describe, expect, test, vi } from 'vitest';

import { safeTry } from '$lib/utils/safe-try';

import { protectedApi, requireAuthenticatedUser } from './api';

const user = { id: 'user-1' } as NonNullable<App.Locals['user']>;

describe('requireAuthenticatedUser', () => {
	test('returns the authenticated user', () => {
		expect(requireAuthenticatedUser(user, new URL('http://tracker.localhost/tasks'))).toBe(user);
	});

	test.each([
		['/', '/login'],
		['/tasks?status=open&page=2', '/login?redirectTo=%2Ftasks%3Fstatus%3Dopen%26page%3D2']
	])(
		'redirects an unauthenticated page load for %s without relying on the layout',
		(path, location) => {
			const outcome = safeTry(() =>
				requireAuthenticatedUser(undefined, new URL(path, 'http://tracker.localhost'))
			);

			expect(outcome).toMatchObject({ ok: false, error: { status: 303, location } });
		}
	);
});

describe('protectedApi', () => {
	test('returns 401 when unauthenticated', async () => {
		const handler = vi.fn(async () => json({ ok: true }));
		const handle = protectedApi(handler);
		const response = await handle(event(undefined));

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ message: 'Unauthorized' });
		expect(handler).not.toHaveBeenCalled();
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
