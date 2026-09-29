<script lang="ts">
	import * as v from 'valibot';

	import { CreateExpenseSchema } from '$lib/schemas/create-expense.schema';
	import { Button } from '$lib/components/ui/button';
	import { DatePicker } from '$lib/components/ui/date-picker';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FieldGroup, Field, FieldLabel, FieldError } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { todayIsoDate } from '$lib/utils/date';
	import type { FormValues } from '$lib/utils/form';

	type Props = {
		submitting?: boolean;
		errorMessage?: string;
		onsubmit: (input: FormValues) => Promise<void>;
	};

	let { submitting = false, errorMessage, onsubmit }: Props = $props();

	let form: HTMLFormElement;
	let expenseDate = $state(todayIsoDate());
	let validationMessage = $state<string>();

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const input = Object.fromEntries(new FormData(form));
		const result = v.safeParse(CreateExpenseSchema, input);
		if (!result.success) {
			validationMessage = result.issues[0]?.message ?? 'Please check the expense details';
			return;
		}

		validationMessage = undefined;
		await onsubmit(input);
	}
</script>

<Dialog.Content class="sm:max-w-sm">
	<Dialog.Header>
		<Dialog.Title>Add expense</Dialog.Title>
		<Dialog.Description
			>Save a single expense with a date, amount, and description.</Dialog.Description
		>
	</Dialog.Header>
	<form bind:this={form} onsubmit={handleSubmit} class="flex flex-col gap-6">
		<input type="hidden" name="expenseDate" value={expenseDate} />

		<FieldGroup>
			{#if errorMessage ?? validationMessage}
				<FieldError errors={[{ message: errorMessage ?? validationMessage }]} />
			{/if}

			<Field>
				<FieldLabel>Amount</FieldLabel>
				<Input name="amount" type="text" inputmode="decimal" placeholder="12.50" required />
			</Field>

			<Field>
				<FieldLabel>Date</FieldLabel>
				<DatePicker bind:value={expenseDate} />
			</Field>

			<Field>
				<FieldLabel>Description</FieldLabel>
				<Input name="description" type="text" placeholder="Coffee" required />
			</Field>

			<Field>
				<FieldLabel>Comments</FieldLabel>
				<Textarea name="comments" placeholder="Optional notes" />
			</Field>
		</FieldGroup>

		<Dialog.Footer>
			<Button type="submit" class="w-full" disabled={submitting}>
				{submitting ? 'Saving…' : 'Save expense'}
			</Button>
		</Dialog.Footer>
	</form>
</Dialog.Content>
