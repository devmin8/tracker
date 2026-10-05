import { building } from '$app/env';
import { requireAuthenticatedUser } from '$lib/server/http';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url, route }) => {
	if (building && !locals.user) {
		throw new Error(
			`Cannot prerender ${route.id}: this route requires a session. Remove prerender = true or move it under (public).`
		);
	}

	const user = requireAuthenticatedUser(locals.user, url);

	return {
		user: {
			name: user.name,
			email: user.email
		}
	};
};
