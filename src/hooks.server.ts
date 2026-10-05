import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import { building } from '$app/env';
import { auth } from '$lib/server/auth';
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

	return svelteKitHandler({ event, resolve, auth, building });
};
