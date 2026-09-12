import type { Handle } from '@sveltejs/kit';
import { error, redirect } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import { building } from '$app/env';
import { auth, loginUrl } from '$lib/server/auth';
import { safeTry } from '$lib/utils/safe-try';

export const handle: Handle = async ({ event, resolve }) => {
	// Fetch current session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	// Make session and user available on server
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	if (!building) {
		// Vite can throw on the first request (no socket yet); prod uses getClientAddress via ADDRESS_HEADER.
		event.request.headers.set('x-client-ip', safeTry(event.getClientAddress, '127.0.0.1'));
	}

	// route.id is null when SvelteKit matched no file — /api/auth/* (hook-mounted) and unmatched 404s.
	const id = event.route.id ?? '';
	const needsLogin = id !== '' && !id.startsWith('/(public)') && !event.locals.user;

	if (!needsLogin) {
		return svelteKitHandler({ event, resolve, auth, building });
	}

	// protected routes
	if (building) {
		throw new Error(
			`Cannot prerender ${event.route.id}: this route requires a session. Remove prerender = true or move it under (public).`
		);
	}

	// `/api` on the route (groups stripped) is an endpoint — 401, not a login redirect.
	const path = id.replace(/\/\([^)]+\)/g, '');
	const isApiRoute = path === '/api' || path.startsWith('/api/');
	if (isApiRoute) error(401, 'Unauthorized');

	redirect(303, loginUrl(event.url));
};
