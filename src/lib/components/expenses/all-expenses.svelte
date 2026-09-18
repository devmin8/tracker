<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import type { Expense } from '$lib/expenses';
	import { formatCents } from '$lib/utils/amount';

	import type { ExpenseAction } from './expense-actions';
	import ExpenseActions from './expense-actions.svelte';

	type Props = {
		expenses: Expense[];
		onAction: (action: ExpenseAction, expense: Expense) => void;
	};

	let { expenses, onAction }: Props = $props();
</script>

<Table.Root containerClass="min-h-0 flex-1 overflow-y-auto">
	<Table.Header sticky>
		<Table.Row>
			<Table.Head>Date</Table.Head>
			<Table.Head>Description</Table.Head>
			<Table.Head>Tag</Table.Head>
			<Table.Head class="text-end">Amount</Table.Head>
			<Table.Head class="w-10">
				<span class="sr-only">Actions</span>
			</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each expenses as expense (expense.id)}
			<Table.Row>
				<Table.Cell>{expense.expenseDate}</Table.Cell>
				<Table.Cell class="lowercase">{expense.description}</Table.Cell>
				<Table.Cell>
					<Badge variant={expense.tag ? 'default' : 'secondary'}>
						{expense.tag ?? 'Unverified'}
					</Badge>
				</Table.Cell>
				<Table.Cell class="text-end">{formatCents(expense.amount)}</Table.Cell>
				<Table.Cell class="text-end">
					<ExpenseActions onAction={(action) => onAction(action, expense)} />
				</Table.Cell>
			</Table.Row>
		{:else}
			<Table.Row>
				<Table.Cell colspan={5} class="text-muted-foreground text-center">
					No expenses for this month
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
