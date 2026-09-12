<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { AllExpenses, GroupedExpense, groupExpenses } from '$lib/components/expenses';
	import { Label } from '$lib/components/ui/label';
	import { MonthPicker } from '$lib/components/ui/month-picker';
	import { Switch } from '$lib/components/ui/switch';
	import { formatCents } from '$lib/utils/amount';
	import { currentYearMonth } from '$lib/utils/date';

	let { data } = $props();

	let grouped = $state(true);

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

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<span class="text-muted-foreground text-sm font-medium">Total expenses</span>
			<span class="text-2xl font-semibold tabular-nums">{formatCents(total)}</span>
		</div>
		<div class="flex items-center gap-3">
			<MonthPicker
				class="w-48"
				bind:value={() => data.month, setMonth}
				max={currentYearMonth()}
				ariaLabel="Month to view"
			/>
			<div class="flex items-center gap-2">
				<Switch id="group-expenses" bind:checked={grouped} />
				<Label for="group-expenses">Group expenses</Label>
			</div>
		</div>
	</div>

	{#if grouped}
		<GroupedExpense {groups} />
	{:else}
		<AllExpenses expenses={data.expenses} />
	{/if}
</div>
