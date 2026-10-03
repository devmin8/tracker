<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import type { ExpenseGroup } from '$lib/expenses';
	import { formatCents } from '$lib/utils/amount';

	import { groupedExpenseActionItems, type ExpenseAction } from './expense-actions';
	import ExpenseActions from './expense-actions.svelte';

	type Props = {
		groups: ExpenseGroup[];
		emptyMessage: string;
		onAction: (action: ExpenseAction, group: ExpenseGroup) => void;
	};

	let { groups, emptyMessage, onAction }: Props = $props();
</script>

<Table.Root class="table-fixed" containerClass="min-h-0 flex-1 overflow-y-auto">
	<Table.Header sticky>
		<Table.Row>
			<Table.Head class="ps-4 pe-2 sm:w-7/20 sm:px-5">Expense</Table.Head>
			<Table.Head class="hidden px-5 sm:table-cell sm:w-1/4">Tag</Table.Head>
			<Table.Head class="w-14 px-2 text-right sm:w-1/5 sm:px-5">Count</Table.Head>
			<Table.Head class="w-24 px-2 text-right sm:w-3/20 sm:px-5">Amount</Table.Head>
			<Table.Head class="w-10 px-1 sm:w-1/20 sm:px-3">
				<span class="sr-only">Actions</span>
			</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each groups as group (group.refinedDescription)}
			<Table.Row>
				<Table.Cell class="overflow-hidden ps-4 pe-2 py-3.5 sm:px-5">
					<p class="truncate font-medium text-xs lowercase sm:text-[15px]">
						{group.refinedDescription}
					</p>
					<div class="mt-1 flex min-w-0 items-center gap-2 sm:hidden">
						<Badge
							class="max-w-24 min-w-0 shrink overflow-hidden px-1.5"
							variant={group.tag ? 'default' : 'secondary'}
						>
							<span class="truncate">{group.tag ?? 'Unverified'}</span>
						</Badge>
					</div>
				</Table.Cell>
				<Table.Cell class="hidden px-5 py-3.5 sm:table-cell">
					<Badge class="sm:text-[13px]" variant={group.tag ? 'default' : 'secondary'}>
						{group.tag ?? 'Unverified'}
					</Badge>
				</Table.Cell>
				<Table.Cell
					class="text-muted-foreground px-2 py-3.5 text-right text-xs tabular-nums sm:px-5 sm:text-[13px]"
				>
					{group.count}
				</Table.Cell>
				<Table.Cell class="px-2 py-3.5 text-right font-medium tabular-nums sm:px-5">
					{formatCents(group.amount)}
				</Table.Cell>
				<Table.Cell class="px-1 py-3.5 text-right sm:px-3">
					<ExpenseActions
						items={groupedExpenseActionItems}
						onAction={(action) => onAction(action, group)}
					/>
				</Table.Cell>
			</Table.Row>
		{:else}
			<Table.Row>
				<Table.Cell colspan={5} class="text-muted-foreground px-5 py-8 text-center">
					{emptyMessage}
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
