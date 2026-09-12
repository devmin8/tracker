<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { formatCents } from '$lib/utils/amount';

	import type { ExpenseGroup } from './group-expenses';

	let { groups }: { groups: ExpenseGroup[] } = $props();
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Expense</Table.Head>
			<Table.Head class="text-end">Count</Table.Head>
			<Table.Head class="text-end">Amount</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each groups as group (group.refinedDescription)}
			<Table.Row>
				<Table.Cell class="font-medium">{group.refinedDescription}</Table.Cell>
				<Table.Cell class="text-end">{group.count}</Table.Cell>
				<Table.Cell class="text-end">{formatCents(group.amount)}</Table.Cell>
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
