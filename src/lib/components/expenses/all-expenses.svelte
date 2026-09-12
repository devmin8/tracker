<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { formatCents } from '$lib/utils/amount';

	import type { Expense } from './group-expenses';

	let { expenses }: { expenses: Expense[] } = $props();
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Date</Table.Head>
			<Table.Head>Description</Table.Head>
			<Table.Head class="text-end">Amount</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each expenses as expense (expense.id)}
			<Table.Row>
				<Table.Cell>{expense.expenseDate}</Table.Cell>
				<Table.Cell class="font-medium">{expense.description}</Table.Cell>
				<Table.Cell class="text-end">{formatCents(expense.amount)}</Table.Cell>
			</Table.Row>
		{:else}
			<Table.Row>
				<Table.Cell colspan={3} class="text-muted-foreground text-center">
					No expenses for this month
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
