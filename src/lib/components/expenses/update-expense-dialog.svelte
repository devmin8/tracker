<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { Expense } from '$lib/expenses';
	import type { FormValues } from '$lib/utils/form';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

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
		if (!expense || submitting) return;

		const current = expense;
		submitting = true;
		errorMessage = undefined;

		const outcome = await request(`/expenses/${current.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});

		const refreshed = outcome.ok ? await safeResolve(invalidateAll) : undefined;
		if (expense !== current) return;
		submitting = false;

		if (!outcome.ok) {
			errorMessage =
				outcome.error.kind === 'network'
					? 'Unable to save the expense. Check your connection and try again.'
					: outcome.error.message;
			return;
		}

		expense = undefined;
		if (!refreshed?.ok) {
			toast.error('Expense saved, but the page could not be refreshed. Please reload the page.');
			return;
		}

		toast.success('Expense updated');
	}
</script>

<Dialog.Root bind:open={() => expense !== undefined, setOpen}>
	{#if expense}
		<UpdateExpenseForm {expense} {submitting} {errorMessage} {onsubmit} />
	{/if}
</Dialog.Root>
