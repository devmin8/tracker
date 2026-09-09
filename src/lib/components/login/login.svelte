<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { FieldGroup, Field, FieldLabel, FieldError } from '$lib/components/ui/field';

	type Props = {
		submitting?: boolean;
		errorMessage?: string;
		onsubmit: (formData: FormData) => Promise<void>;
	};

	let { submitting = false, errorMessage, onsubmit }: Props = $props();
	let form: HTMLFormElement;

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await onsubmit(new FormData(form));
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title>Login to your account</Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form bind:this={form} onsubmit={handleSubmit}>
			<FieldGroup>
				{#if errorMessage}
					<FieldError errors={[{ message: errorMessage }]} />
				{/if}

				<!-- TODO: remove the hardcoded value -->
				<Field>
					<FieldLabel>Email</FieldLabel>
					<Input
						name="email"
						type="email"
						placeholder="m@example.com"
						autocomplete="email"
						required
						value="test@test.com"
					/>
				</Field>

				<!-- TODO: remove the hardcoded value -->
				<Field>
					<FieldLabel>Password</FieldLabel>
					<Input
						name="password"
						type="password"
						autocomplete="current-password"
						required
						maxlength={90}
						value="test@123"
					/>
				</Field>

				<Field>
					<Button type="submit" class="w-full" disabled={submitting}>
						{submitting ? 'Signing in…' : 'Login'}
					</Button>
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
