<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import { LoginForm } from '$lib/components/login';
	import { ToggleTheme } from '$lib/components/toggle-theme';
	import { LoginSchema } from '$lib/schemas/auth';
	import * as v from 'valibot';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();

	async function onsubmit(formData: FormData) {
		const result = v.safeParse(LoginSchema, Object.fromEntries(formData));

		if (!result.success) {
			errorMessage = result.issues[0]?.message ?? 'Please check your sign-in details';
			return;
		}

		submitting = true;
		errorMessage = undefined;

		try {
			const { error } = await authClient.signIn.email(result.output);

			if (error) {
				errorMessage =
					error.status === 429
						? 'Too many sign-in attempts. Try again later.'
						: error.message || 'Sign in failed';
				return;
			}

			await goto(resolve(data.redirectTo as '/'));
		} catch {
			errorMessage = 'Unable to sign in. Check your connection and try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="relative flex h-screen items-center justify-center px-4">
	<div class="absolute top-4 right-4">
		<ToggleTheme />
	</div>
	<LoginForm {submitting} {errorMessage} {onsubmit} />
</div>
