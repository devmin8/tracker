import { requireAuthenticatedUser } from '$lib/server/http';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = requireAuthenticatedUser(locals.user);

	return {
		user: {
			name: user.name,
			email: user.email
		}
	};
};
