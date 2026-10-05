<script lang="ts">
	import { Search } from '@lucide/svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		AllExpenses,
		GroupedExpense,
		ManageExpenses,
		TagGroupedExpense
	} from '$lib/components/expenses';
	import { ListPagination } from '$lib/components/list-pagination';
	import { Button } from '$lib/components/ui/button';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Select from '$lib/components/ui/select';
	import {
		EXPENSE_GROUPING_OPTIONS,
		parseExpenseGrouping,
		toExpenseReportParams,
		type ExpenseGrouping,
		type ExpenseReportQuery
	} from '$lib/expenses';
	import { formatCents } from '$lib/utils/amount';

	let { data } = $props();

	const emptyMessage = $derived(
		data.search ? `No expenses match "${data.search}"` : 'No expenses recorded yet'
	);

	function setGroup(next: ExpenseGrouping) {
		if (next === data.group) return;

		navigate({ search: data.search, group: next, page: 1 });
	}

	function setPage(page: number) {
		if (page === data.pagination.page) return;

		navigate({ search: data.search, group: data.group, page });
	}

	function navigate(next: ExpenseReportQuery) {
		goto(resolve(`/reports/expenses?${toExpenseReportParams(next)}`), {
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
			<span class="text-xl font-semibold tabular-nums">{formatCents(data.amount)}</span>
		</div>
		<div class="flex flex-wrap items-center gap-3 sm:flex-nowrap">
			<Select.Root
				type="single"
				value={data.group}
				items={[...EXPENSE_GROUPING_OPTIONS]}
				onValueChange={(next) => setGroup(parseExpenseGrouping(next))}
			>
				<Select.Trigger class="w-36" aria-label="Group expenses">
					<Select.Value placeholder="Group by" />
				</Select.Trigger>
				<Select.Content>
					{#each EXPENSE_GROUPING_OPTIONS as option (option.value)}
						<Select.Item value={option.value} label={option.label}>
							{option.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<form method="GET" action={resolve('/reports/expenses')} class="flex w-full gap-2 sm:w-auto">
				<input type="hidden" name="group" value={data.group} />
				<InputGroup.Root class="w-full sm:w-64">
					<InputGroup.Addon>
						<Search />
					</InputGroup.Addon>
					<InputGroup.Input
						type="search"
						name="q"
						placeholder="Search title or tag"
						aria-label="Search expenses by title or tag"
						value={data.search}
					/>
				</InputGroup.Root>
				<Button type="submit">Search</Button>
			</form>
		</div>
	</div>

	<ManageExpenses>
		{#snippet children({ onExpenseAction, onGroupAction })}
			{#if data.group === 'tag'}
				<TagGroupedExpense groups={data.rows} {emptyMessage} />
			{:else if data.group === 'expense'}
				<GroupedExpense groups={data.rows} {emptyMessage} onAction={onGroupAction} />
			{:else}
				<AllExpenses expenses={data.rows} {emptyMessage} onAction={onExpenseAction} />
			{/if}
		{/snippet}
	</ManageExpenses>

	<ListPagination {...data.pagination} onPageChange={setPage} />
</div>
