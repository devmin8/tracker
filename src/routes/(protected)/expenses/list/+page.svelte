<script lang="ts">
	import { Plus } from '@lucide/svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import {
		AllExpenses,
		AddExpenseDialog,
		GroupedExpense,
		ManageExpenses
	} from '$lib/components/expenses';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { MonthPicker } from '$lib/components/ui/month-picker';
	import { Switch } from '$lib/components/ui/switch';
	import { groupExpenses } from '$lib/expenses';
	import { formatCents } from '$lib/utils/amount';
	import { currentYearMonth } from '$lib/utils/date';

	let { data } = $props();

	let grouped = $state(false);
	let addingExpense = $state(false);

	const emptyMessage = 'No expenses for this month';

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
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-4 border bg-card p-4">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
			<Button onclick={() => (addingExpense = true)}>
				<Plus />
				Add
			</Button>
		</div>
	</div>

	<ManageExpenses>
		{#snippet children({ onExpenseAction, onGroupAction })}
			{#if grouped}
				<GroupedExpense {groups} {emptyMessage} onAction={onGroupAction} />
			{:else}
				<AllExpenses expenses={data.expenses} {emptyMessage} onAction={onExpenseAction} />
			{/if}
		{/snippet}
	</ManageExpenses>
</div>

<AddExpenseDialog bind:open={addingExpense} />
