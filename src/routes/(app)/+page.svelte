<script lang="ts">
	import { ArrowDownRight, ArrowUpRight, ChevronRight, Plus } from '@lucide/svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AddExpenseDialog, AllExpenses, ManageExpenses } from '$lib/components/expenses';
	import { Button } from '$lib/components/ui/button';
	import { MonthPicker } from '$lib/components/ui/month-picker';
	import { formatCents } from '$lib/utils/amount';
	import { currentYearMonth } from '$lib/utils/date';

	let { data } = $props();

	let addingExpense = $state(false);

	const tagColors = ['bg-teal-500', 'bg-sky-500', 'bg-amber-500', 'bg-slate-500'] as const;

	const spendingChange = $derived(data.spent - data.previousMonthSpent);
	const spendingChangePercent = $derived(
		data.previousMonthSpent === 0 ? 0 : Math.abs((spendingChange / data.previousMonthSpent) * 100)
	);
	const hasPreviousSpending = $derived(data.previousMonthSpent > 0);

	function setMonth(month: string) {
		if (month === data.month) return;

		goto(resolve(`/?month=${month}`), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	function formatShare(share: number) {
		return `${share.toFixed(share >= 10 ? 0 : 1)}%`;
	}

	function tagColor(index: number) {
		return tagColors[index % tagColors.length];
	}

	function recentExpensesUrl() {
		return resolve(`/expenses/list?month=${data.month}`);
	}
</script>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-6">
	<section class="flex justify-end py-2">
		<div class="flex flex-wrap justify-end gap-2">
			<MonthPicker
				class="w-44 bg-card"
				bind:value={() => data.month, setMonth}
				max={currentYearMonth()}
				ariaLabel="Month to view"
			/>
			<Button class="shrink-0" onclick={() => (addingExpense = true)}>
				<Plus />
				Add expense
			</Button>
		</div>
	</section>

	<section class="overflow-hidden border bg-card">
		<div class="flex flex-wrap items-center gap-x-3 gap-y-1 border-b p-5">
			<p class="text-3xl font-semibold tracking-tight tabular-nums">{formatCents(data.spent)}</p>
			{#if hasPreviousSpending}
				<div
					class:text-emerald-700={spendingChange < 0}
					class:text-destructive={spendingChange > 0}
					class="text-muted-foreground flex items-center gap-1 text-sm"
				>
					{#if spendingChange < 0}
						<ArrowDownRight class="size-3.5" />
					{:else}
						<ArrowUpRight class="size-3.5" />
					{/if}
					<span
						>{formatShare(spendingChangePercent)}
						{spendingChange <= 0 ? 'lower' : 'higher'} than last month</span
					>
				</div>
			{/if}
		</div>
		<div class="min-w-0 p-5">
			{#if data.tagSpending.length > 0}
				<div class="flex h-1.5 overflow-hidden bg-muted" aria-label="Spending by tag">
					{#each data.tagSpending as tag, index (tag.name)}
						<div class={tagColor(index)} style={`width: ${tag.share}%`}></div>
					{/each}
				</div>
				<div class="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
					{#each data.tagSpending as tag (tag.name)}
						<div class="flex min-w-0 items-center gap-2.5">
							<span class="min-w-0 truncate text-sm">{tag.name}</span>
							<span class="text-muted-foreground shrink-0 text-sm font-medium tabular-nums">
								{formatShare(tag.share)}
							</span>
							<span class="ml-auto w-21 shrink-0 text-right text-sm font-medium tabular-nums">
								{formatCents(tag.amount)}
							</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<section class="flex flex-col gap-3 pt-4">
		<div class="flex items-end justify-between gap-4">
			<div>
				<h2 class="font-semibold">Recent expenses</h2>
				<p class="text-muted-foreground mt-0.5 text-sm">Your latest recorded transactions</p>
			</div>
			<a
				href={recentExpensesUrl()}
				class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
			>
				View all <ChevronRight class="size-4" />
			</a>
		</div>
		<div class="min-w-0 border bg-card">
			<ManageExpenses>
				{#snippet children({ onExpenseAction })}
					<AllExpenses
						expenses={data.recentExpenses}
						onAction={onExpenseAction}
						emptyMessage="No expenses recorded this month."
						scrollable={false}
						headerHover={false}
					/>
				{/snippet}
			</ManageExpenses>
		</div>
	</section>
</div>

<AddExpenseDialog bind:open={addingExpense} />
