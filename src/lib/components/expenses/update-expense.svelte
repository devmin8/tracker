<script lang="ts">
	import * as v from 'valibot';

	import { UpdateExpenseSchema } from '$lib/schemas/update-expense.schema';
	import { Button } from '$lib/components/ui/button';
	import { DatePicker } from '$lib/components/ui/date-picker';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FieldGroup, Field, FieldLabel, FieldError } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { centsToInput } from '$lib/utils/amount';
	import type { FormValues } from '$lib/utils/form';

	type ExpenseValues = {
		amount: number;
		expenseDate: string;
		comments: string | null;
	};

	type Props = {
		expense: ExpenseValues;
		submitting?: boolean;
		errorMessage?: string;
		onsubmit: (input: FormValues) => Promise<void>;
	};

	let { expense, submitting = false, errorMessage, onsubmit }: Props = $props();

	let form: HTMLFormElement;
	let amount = $derived(centsToInput(expense.amount));
	let expenseDate = $derived(expense.expenseDate);
	let comments = $derived(expense.comments ?? '');
	let validationMessage = $state<string>();

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const input = Object.fromEntries(new FormData(form));
		const result = v.safeParse(UpdateExpenseSchema, input);
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
		<Dialog.Title>Update expense</Dialog.Title>
		<Dialog.Description>Change the amount, date, or comments for this expense.</Dialog.Description>
	</Dialog.Header>
	<form bind:this={form} onsubmit={handleSubmit} class="flex flex-col gap-6">
		<input type="hidden" name="expenseDate" value={expenseDate} />

		<FieldGroup>
			{#if errorMessage ?? validationMessage}
				<FieldError errors={[{ message: errorMessage ?? validationMessage }]} />
			{/if}

			<Field>
				<FieldLabel>Amount</FieldLabel>
				<Input
					name="amount"
					type="text"
					inputmode="decimal"
					placeholder="12.50"
					required
					bind:value={amount}
				/>
			</Field>

			<Field>
				<FieldLabel>Date</FieldLabel>
				<DatePicker bind:value={expenseDate} />
			</Field>

			<Field>
				<FieldLabel>Comments</FieldLabel>
				<Textarea name="comments" placeholder="Optional notes" bind:value={comments} />
			</Field>
		</FieldGroup>

		<Dialog.Footer>
			<Button type="submit" class="w-full" disabled={submitting}>
				{submitting ? 'Saving…' : 'Save changes'}
			</Button>
		</Dialog.Footer>
	</form>
</Dialog.Content>
