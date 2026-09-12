<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { Label } from '$lib/components/ui/label';
	import { MonthPicker } from '$lib/components/ui/month-picker';
	import { Switch } from '$lib/components/ui/switch';
	import * as Table from '$lib/components/ui/table';
	import { currentCalendarMonth } from '$lib/utils/date';

	let { data } = $props();

	let groupExpenses = $state(false);

	const grouped = $derived.by(() => {
		const groups = new SvelteMap<
			string,
			{
				refinedDescription: string;
				count: number;
				amount: number;
			}
		>();

		for (const expense of data.expenses) {
			const refinedDescription = expense.refinedDescription || expense.description;
			const group = groups.get(refinedDescription);

			if (group) {
				group.count += 1;
				group.amount += expense.amount;
				continue;
			}

			groups.set(refinedDescription, { refinedDescription, count: 1, amount: expense.amount });
		}

		return Array.from(groups.values());
	});

	function formatCents(cents: number) {
		return `${cents < 0 ? '-' : ''}$${(Math.abs(cents) / 100).toFixed(2)}`;
	}

	function setMonth(month: string) {
		if (month === data.month) return;
		void goto(resolve(`/expenses/list?month=${month}`), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}
</script>

{#snippet emptyRow()}
	<Table.Row>
		<Table.Cell colspan={3} class="text-muted-foreground text-center">
			No expenses for this month
		</Table.Cell>
	</Table.Row>
{/snippet}

{#snippet allExpenses()}
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Date</Table.Head>
				<Table.Head>Description</Table.Head>
				<Table.Head class="text-end">Amount</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.expenses as expense (expense.id)}
				<Table.Row>
					<Table.Cell>{expense.expenseDate}</Table.Cell>
					<Table.Cell class="font-medium">{expense.description}</Table.Cell>
					<Table.Cell class="text-end">{formatCents(expense.amount)}</Table.Cell>
				</Table.Row>
			{:else}
				{@render emptyRow()}
			{/each}
		</Table.Body>
	</Table.Root>
{/snippet}

{#snippet groupedExpenses()}
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Expense</Table.Head>
				<Table.Head class="text-end">Count</Table.Head>
				<Table.Head class="text-end">Amount</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each grouped as group (group.refinedDescription)}
				<Table.Row>
					<Table.Cell class="font-medium">{group.refinedDescription}</Table.Cell>
					<Table.Cell class="text-end">{group.count}</Table.Cell>
					<Table.Cell class="text-end">{formatCents(group.amount)}</Table.Cell>
				</Table.Row>
			{:else}
				{@render emptyRow()}
			{/each}
		</Table.Body>
	</Table.Root>
{/snippet}

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-end gap-3">
		<MonthPicker
			class="w-48"
			bind:value={() => data.month, setMonth}
			max={currentCalendarMonth()}
			ariaLabel="Month to view"
		/>
		<div class="flex items-center gap-2">
			<Switch id="group-expenses" bind:checked={groupExpenses} />
			<Label for="group-expenses">Group expenses</Label>
		</div>
	</div>

	{#if groupExpenses}
		{@render groupedExpenses()}
	{:else}
		{@render allExpenses()}
	{/if}
</div>
