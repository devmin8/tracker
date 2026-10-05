<script lang="ts">
	import * as v from 'valibot';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import { LoginForm, LoginSchema } from '$lib/components/login';
	import { ToggleTheme } from '$lib/components/toggle-theme';
	import { safeResolve } from '$lib/utils/safe-resolve';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();

	async function onsubmit(formData: FormData) {
		if (submitting) return;
		const result = v.safeParse(LoginSchema, Object.fromEntries(formData));

		if (!result.success) {
			errorMessage = result.issues[0]?.message ?? 'Please check your sign-in details';
			return;
		}

		submitting = true;
		errorMessage = undefined;

		const outcome = await safeResolve(async () => {
			const response = await authClient.signIn.email(result.output);
			if (!response.error) await goto(resolve(data.redirectTo as '/'));
			return response;
		});
		submitting = false;

		if (!outcome.ok) {
			errorMessage = 'Unable to sign in. Check your connection and try again.';
			return;
		}

		const { error } = outcome.result;
		if (error) {
			errorMessage =
				error.status === 429
					? 'Too many sign-in attempts. Try again later.'
					: error.message || 'Sign in failed';
		}
	}
</script>

<div class="relative flex h-screen items-center justify-center px-4">
	<div class="absolute top-4 right-4">
		<ToggleTheme />
	</div>
	<LoginForm {submitting} {errorMessage} {onsubmit} />
</div>
