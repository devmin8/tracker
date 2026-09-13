<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { FormValues } from '$lib/utils/form';
	import { request } from '$lib/utils/request';

	import AddExpenseForm, { type ExpenseTagOption } from './add-expense.svelte';

	type Props = {
		open?: boolean;
		tags: ExpenseTagOption[];
	};

	let { open = $bindable(false), tags }: Props = $props();

	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();

	function onOpenChange(next: boolean) {
		if (!next) errorMessage = undefined;
	}

	async function onsubmit(input: FormValues) {
		submitting = true;
		errorMessage = undefined;

		const outcome = await request<{ id: string }>('/expenses/add', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});

		if (outcome.ok) {
			await invalidateAll();
			open = false;
			toast.success('Expense added');
		} else {
			errorMessage =
				outcome.error.kind === 'network'
					? 'Unable to save the expense. Check your connection and try again.'
					: outcome.error.message;
		}

		submitting = false;
	}
</script>

<Dialog.Root bind:open {onOpenChange}>
	{#if open}
		<AddExpenseForm {tags} {submitting} {errorMessage} {onsubmit} />
	{/if}
</Dialog.Root>
