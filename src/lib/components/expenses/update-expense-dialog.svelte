<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { Expense } from '$lib/expenses';
	import type { FormValues } from '$lib/utils/form';
	import { request } from '$lib/utils/request';

	import UpdateExpenseForm from './update-expense.svelte';

	type Props = {
		expense: Expense | undefined;
	};

	let { expense = $bindable() }: Props = $props();

	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();

	function setOpen(open: boolean) {
		if (open) return;
		expense = undefined;
		errorMessage = undefined;
		submitting = false;
	}

	async function onsubmit(input: FormValues) {
		if (!expense) return;

		const current = expense;
		submitting = true;
		errorMessage = undefined;

		const outcome = await request<{ id: string }>(`/expenses/${current.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});

		if (outcome.ok) {
			await invalidateAll();
			expense = undefined;
			toast.success('Expense updated');
		} else {
			errorMessage =
				outcome.error.kind === 'network'
					? 'Unable to save the expense. Check your connection and try again.'
					: outcome.error.message;
		}

		submitting = false;
	}
</script>

<Dialog.Root bind:open={() => expense !== undefined, setOpen}>
	{#if expense}
		<UpdateExpenseForm {expense} {submitting} {errorMessage} {onsubmit} />
	{/if}
</Dialog.Root>
