<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FieldError } from '$lib/components/ui/field';
	import { formatCents } from '$lib/utils/amount';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	export type DeletableExpense = {
		id: string;
		description: string;
		amount: number;
	};

	type Props = {
		expense: DeletableExpense | undefined;
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

	async function confirmDelete() {
		if (!expense || submitting) return;

		const current = expense;
		submitting = true;
		errorMessage = undefined;

		const outcome = await request(`/expenses/${current.id}`, {
			method: 'DELETE'
		});

		const refreshed = outcome.ok ? await safeResolve(invalidateAll) : undefined;
		if (expense !== current) return;
		submitting = false;

		if (!outcome.ok) {
			errorMessage =
				outcome.error.kind === 'network'
					? 'Unable to delete the expense. Check your connection and try again.'
					: outcome.error.message;
			return;
		}

		expense = undefined;
		if (!refreshed?.ok) {
			toast.error('Expense deleted, but the page could not be refreshed. Please reload the page.');
			return;
		}

		toast.success('Expense deleted');
	}
</script>

<Dialog.Root bind:open={() => expense !== undefined, setOpen}>
	{#if expense}
		<Dialog.Content class="sm:max-w-sm">
			<Dialog.Header>
				<Dialog.Title>Delete expense</Dialog.Title>
				<Dialog.Description>
					This will permanently delete <span class="lowercase">{expense.description}</span>
					({formatCents(expense.amount)}). This cannot be undone.
				</Dialog.Description>
			</Dialog.Header>

			{#if errorMessage}
				<FieldError errors={[{ message: errorMessage }]} />
			{/if}

			<Dialog.Footer>
				<Button variant="outline" onclick={() => setOpen(false)} disabled={submitting}>
					Cancel
				</Button>
				<Button variant="destructive" onclick={confirmDelete} disabled={submitting}>
					{submitting ? 'Deleting…' : 'Delete'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	{/if}
</Dialog.Root>
