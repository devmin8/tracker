<script lang="ts">
	import * as v from 'valibot';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FieldGroup, Field, FieldLabel, FieldError } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';

	import { UpdateTagsSchema, type UpdateTagsInput } from './update-tags-form.schema';

	export type UpdateTagsFailure = {
		message: string;
	};

	type Props = {
		refinedDescription: string;
		name?: string | null;
		onsubmit: (input: UpdateTagsInput) => Promise<UpdateTagsFailure | void>;
	};

	let { refinedDescription, name: existingName, onsubmit }: Props = $props();

	let form: HTMLFormElement;
	let name = $derived(existingName ?? '');
	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();
	let validationMessage = $state<string>();

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const result = v.safeParse(UpdateTagsSchema, Object.fromEntries(new FormData(form)));
		if (!result.success) {
			validationMessage = result.issues[0]?.message ?? 'Please check the tag details';
			return;
		}

		validationMessage = undefined;
		errorMessage = undefined;
		submitting = true;

		try {
			const failure = await onsubmit(result.output);
			if (failure) errorMessage = failure.message;
		} catch {
			errorMessage = 'Unable to save the tag. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<Dialog.Content class="sm:max-w-sm">
	<Dialog.Header>
		<Dialog.Title>Update tag</Dialog.Title>
		<Dialog.Description class="lowercase">{refinedDescription}</Dialog.Description>
	</Dialog.Header>
	<form bind:this={form} onsubmit={handleSubmit} class="flex flex-col gap-6">
		<input type="hidden" name="refinedDescription" value={refinedDescription} />

		<FieldGroup>
			{#if errorMessage ?? validationMessage}
				<FieldError errors={[{ message: errorMessage ?? validationMessage }]} />
			{/if}

			<Field>
				<FieldLabel>Tag</FieldLabel>
				<Input
					name="name"
					type="text"
					placeholder="Groceries"
					required
					maxlength={50}
					bind:value={name}
				/>
			</Field>
		</FieldGroup>

		<Dialog.Footer>
			<Button type="submit" class="w-full" disabled={submitting}>
				{submitting ? 'Saving…' : 'Save tag'}
			</Button>
		</Dialog.Footer>
	</form>
</Dialog.Content>
