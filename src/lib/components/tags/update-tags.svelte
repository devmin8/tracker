<script lang="ts">
	import * as v from 'valibot';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FieldGroup, Field, FieldLabel, FieldError } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';

	import { UpdateTagsSchema, type UpdateTagsInput } from './update-tags-form.schema';

	type Props = {
		refinedDescription: string;
		submitting?: boolean;
		errorMessage?: string;
		onsubmit: (input: UpdateTagsInput) => Promise<void>;
	};

	let { refinedDescription, submitting = false, errorMessage, onsubmit }: Props = $props();

	let form: HTMLFormElement;

	let validationMessage = $state<string>();

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const result = v.safeParse(UpdateTagsSchema, Object.fromEntries(new FormData(form)));
		if (!result.success) {
			validationMessage = result.issues[0]?.message ?? 'Please check the tag details';
			return;
		}

		validationMessage = undefined;
		await onsubmit(result.output);
	}
</script>

<Dialog.Content class="sm:max-w-sm">
	<Dialog.Header>
		<Dialog.Title>Update tags</Dialog.Title>
		<Dialog.Description>{refinedDescription}</Dialog.Description>
	</Dialog.Header>
	<form bind:this={form} onsubmit={handleSubmit} class="flex flex-col gap-6">
		<input type="hidden" name="refinedDescription" value={refinedDescription} />

		<FieldGroup>
			{#if errorMessage ?? validationMessage}
				<FieldError errors={[{ message: errorMessage ?? validationMessage }]} />
			{/if}

			<Field>
				<FieldLabel>Tag</FieldLabel>
				<Input name="name" type="text" placeholder="Groceries" required maxlength={50} />
			</Field>
		</FieldGroup>

		<Dialog.Footer>
			<Button type="submit" class="w-full" disabled={submitting}>
				{submitting ? 'Saving…' : 'Save tag'}
			</Button>
		</Dialog.Footer>
	</form>
</Dialog.Content>
