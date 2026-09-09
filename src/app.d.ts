// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { auth } from '$lib/server/auth/better-auth';

type Session = typeof auth.$Infer.Session;

declare global {
	namespace App {
		interface Locals {
			user?: Session['user'];
			session?: Session['session'];
		}
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
