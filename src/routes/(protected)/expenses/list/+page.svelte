<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';

	import {
		AddExpenseDialog,
		AllExpenses,
		DeleteExpenseDialog,
		GroupedExpense,
		groupExpenses,
		type Expense,
		type ExpenseAction,
		type ExpenseGroup
	} from '$lib/components/expenses';
	import { UpdateTagsForm } from '$lib/components/tags';
	import type { UpdateTagsInput } from '$lib/components/tags/update-tags-form.schema';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { MonthPicker } from '$lib/components/ui/month-picker';
	import { Switch } from '$lib/components/ui/switch';
	import { formatCents } from '$lib/utils/amount';
	import { currentYearMonth } from '$lib/utils/date';
	import { request } from '$lib/utils/request';

	let { data } = $props();

	let grouped = $state(true);
	let addExpenseOpen = $state(false);
	let taggingDescription = $state<string | undefined>();
	let deletingExpense = $state<Expense | undefined>();
	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();

	const total = $derived(data.expenses.reduce((sum, expense) => sum + expense.amount, 0));

	const groups = $derived(groupExpenses(data.expenses));

	function setMonth(month: string) {
		if (month === data.month) return;
		goto(resolve(`/expenses/list?month=${month}`), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	function openTagEditor(refinedDescription: string) {
		taggingDescription = refinedDescription;
		errorMessage = undefined;
	}

	function onGroupAction(action: ExpenseAction, group: ExpenseGroup) {
		if (action !== 'update-tags') return;
		openTagEditor(group.refinedDescription);
	}

	function onExpenseAction(action: ExpenseAction, expense: Expense) {
		if (action === 'delete') {
			deletingExpense = expense;
		} else if (action === 'update-tags') {
			openTagEditor(expense.refinedDescription);
		}
	}

	function setDialogOpen(open: boolean) {
		if (open) return;
		taggingDescription = undefined;
		errorMessage = undefined;
	}

	async function onsubmit(input: UpdateTagsInput) {
		submitting = true;
		errorMessage = undefined;

		const outcome = await request('/expenses/tags', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});

		if (outcome.ok) {
			await invalidateAll();
			taggingDescription = undefined;
			toast.success('Tag updated');
		} else {
			errorMessage =
				outcome.error.kind === 'network'
					? 'Unable to save the tag. Check your connection and try again.'
					: outcome.error.message;
		}

		submitting = false;
	}
</script>

<div class="flex min-h-0 flex-1 flex-col gap-4">
	<div class="flex items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<span class="text-muted-foreground text-sm font-medium">Total :</span>
			<span class="text-xl font-semibold tabular-nums">{formatCents(total)}</span>
		</div>
		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				<Switch id="group-expenses" bind:checked={grouped} />
				<Label for="group-expenses">Group expenses</Label>
			</div>
			<MonthPicker
				class="w-48"
				bind:value={() => data.month, setMonth}
				max={currentYearMonth()}
				ariaLabel="Month to view"
			/>
			<Button onclick={() => (addExpenseOpen = true)}>
				<Plus />
				Add
			</Button>
		</div>
	</div>

	{#if grouped}
		<GroupedExpense {groups} onAction={onGroupAction} />
	{:else}
		<AllExpenses expenses={data.expenses} onAction={onExpenseAction} />
	{/if}
</div>

<Dialog.Root bind:open={() => taggingDescription !== undefined, setDialogOpen}>
	{#if taggingDescription}
		<UpdateTagsForm
			refinedDescription={taggingDescription}
			{submitting}
			{errorMessage}
			{onsubmit}
		/>
	{/if}
</Dialog.Root>

<AddExpenseDialog tags={data.tags} bind:open={addExpenseOpen} />
<DeleteExpenseDialog bind:expense={deletingExpense} />
