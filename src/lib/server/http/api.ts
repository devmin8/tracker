import {
	isHttpError,
	isRedirect,
	json,
	redirect,
	type RequestEvent,
	type RequestHandler
} from '@sveltejs/kit';

import { loginUrl } from '$lib/server/auth/redirect';
import { safeResolve } from '$lib/utils/safe-resolve';
import type { SafeTryResult } from '$lib/utils/safe-try';

type ApiHandler = (event: RequestEvent, user: NonNullable<App.Locals['user']>) => Promise<Response>;

type ApiError = {
	message: string;
};

// Page loads redirect to login; endpoints use protectedApi for JSON 401 responses.
export function requireAuthenticatedUser(
	user: App.Locals['user'],
	url: URL
): NonNullable<App.Locals['user']> {
	if (!user) {
		redirect(303, loginUrl(url));
	}

	return user;
}

export function protectedApi(handler: ApiHandler): RequestHandler {
	return async (event) => {
		const { user } = event.locals;
		if (!user) {
			return apiError(401, 'Unauthorized');
		}

		const outcome = await safeResolve(() => handler(event, user));
		if (outcome.ok) return outcome.result;

		// SvelteKit error()/redirect() must be rethrown so the framework can handle them.
		if (isHttpError(outcome.error) || isRedirect(outcome.error)) {
			throw outcome.error;
		}

		console.error('API request failed', outcome.error);
		return apiError(500, 'Something went wrong. Please try again.');
	};
}

export function apiError(status: number, message: string) {
	return json({ message } satisfies ApiError, { status });
}

export function badRequest(message: string) {
	return apiError(400, message);
}

export function validationError(issues: readonly { message?: string }[], fallbackMessage: string) {
	return badRequest(issues[0]?.message ?? fallbackMessage);
}

export function readJson(request: Request): Promise<SafeTryResult<unknown>> {
	return safeResolve(() => request.json());
}

export function readFormData(request: Request): Promise<SafeTryResult<FormData>> {
	return safeResolve(() => request.formData());
}
