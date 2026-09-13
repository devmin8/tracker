<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import { formatCents } from '$lib/utils/amount';

	import { groupedExpenseActionItems, type ExpenseAction } from './expense-actions';
	import ExpenseActions from './expense-actions.svelte';
	import type { ExpenseGroup } from './group-expenses';

	type Props = {
		groups: ExpenseGroup[];
		onAction: (action: ExpenseAction, group: ExpenseGroup) => void;
	};

	let { groups, onAction }: Props = $props();
</script>

<Table.Root containerClass="min-h-0 flex-1 overflow-y-auto">
	<Table.Header sticky>
		<Table.Row>
			<Table.Head>Expense</Table.Head>
			<Table.Head>Tag</Table.Head>
			<Table.Head class="text-end">Count</Table.Head>
			<Table.Head class="text-end">Amount</Table.Head>
			<Table.Head class="w-10">
				<span class="sr-only">Actions</span>
			</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each groups as group (group.refinedDescription)}
			<Table.Row>
				<Table.Cell class="lowercase">{group.refinedDescription}</Table.Cell>
				<Table.Cell>
					<Badge variant={group.tag ? 'default' : 'secondary'}>
						{group.tag ?? 'Unverified'}
					</Badge>
				</Table.Cell>
				<Table.Cell class="text-end">{group.count}</Table.Cell>
				<Table.Cell class="text-end">{formatCents(group.amount)}</Table.Cell>
				<Table.Cell class="text-end">
					<ExpenseActions
						items={groupedExpenseActionItems}
						onAction={(action) => onAction(action, group)}
					/>
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
