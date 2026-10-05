<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { FormValues } from '$lib/utils/form';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	import AddExpenseForm from './add-expense.svelte';

	type Props = {
		open?: boolean;
	};

	let { open = $bindable(false) }: Props = $props();

	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();
	let dialogVersion = 0;

	function onOpenChange(next: boolean) {
		if (next) return;
		dialogVersion += 1;
		errorMessage = undefined;
		submitting = false;
	}

	async function onsubmit(input: FormValues) {
		if (submitting) return;
		const submittedVersion = dialogVersion;
		submitting = true;
		errorMessage = undefined;

		const outcome = await request('/expenses/add', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});

		const refreshed = outcome.ok ? await safeResolve(invalidateAll) : undefined;
		if (dialogVersion !== submittedVersion) return;
		submitting = false;

		if (!outcome.ok) {
			errorMessage =
				outcome.error.kind === 'network'
					? 'Unable to save the expense. Check your connection and try again.'
					: outcome.error.message;
			return;
		}

		open = false;
		if (!refreshed?.ok) {
			toast.error('Expense added, but the page could not be refreshed. Please reload the page.');
			return;
		}
		toast.success('Expense added');
	}
</script>

<Dialog.Root bind:open {onOpenChange}>
	{#if open}
		<AddExpenseForm {submitting} {errorMessage} {onsubmit} />
	{/if}
</Dialog.Root>
