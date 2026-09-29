<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import type { Expense } from '$lib/expenses';
	import { formatCents } from '$lib/utils/amount';
	import { formatDisplayDate } from '$lib/utils/date';
	import { cn } from '$lib/utils/cn';

	import type { ExpenseAction } from './expense-actions';
	import ExpenseActions from './expense-actions.svelte';

	type Props = {
		expenses: Expense[];
		emptyMessage: string;
		onAction: (action: ExpenseAction, expense: Expense) => void;
		descriptionSize?: 'xs' | 'sm';
		lowercaseDescription?: boolean;
		scrollable?: boolean;
		headerHover?: boolean;
	};

	let {
		expenses,
		emptyMessage,
		onAction,
		descriptionSize = 'sm',
		lowercaseDescription = true,
		scrollable = true,
		headerHover = true
	}: Props = $props();
</script>

<Table.Root
	class="table-fixed"
	containerClass={scrollable ? 'min-h-0 flex-1 overflow-y-auto' : undefined}
>
	<Table.Header sticky={scrollable}>
		<Table.Row class={headerHover ? undefined : 'hover:bg-transparent'}>
			<Table.Head class="ps-4 pe-2 sm:w-7/20 sm:px-5">
				<span class="sm:hidden">Expense</span>
				<span class="hidden sm:inline">Title</span>
			</Table.Head>
			<Table.Head class="hidden px-5 sm:table-cell sm:w-1/4">Tag</Table.Head>
			<Table.Head class="hidden px-5 sm:table-cell sm:w-1/5">Date</Table.Head>
			<Table.Head class="w-24 px-2 text-right sm:w-3/20 sm:px-5">Amount</Table.Head>
			<Table.Head class="w-10 px-1 sm:w-1/20 sm:px-3">
				<span class="sr-only">Actions</span>
			</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each expenses as expense (expense.id)}
			<Table.Row>
				<Table.Cell class="overflow-hidden ps-4 pe-2 py-3.5 sm:px-5">
					<p
						class={cn(
							'truncate font-medium',
							descriptionSize === 'sm' ? 'text-sm' : 'text-xs',
							lowercaseDescription && 'lowercase'
						)}
					>
						{expense.description}
					</p>
					<div class="mt-1 flex min-w-0 items-center gap-2 sm:hidden">
						<p class="text-muted-foreground shrink-0 text-xs">
							{formatDisplayDate(expense.expenseDate) ?? expense.expenseDate}
						</p>
						<Badge
							class="max-w-24 min-w-0 shrink overflow-hidden px-1.5"
							variant={expense.tag ? 'default' : 'secondary'}
						>
							<span class="truncate">{expense.tag ?? 'Untagged'}</span>
						</Badge>
					</div>
				</Table.Cell>
				<Table.Cell class="hidden px-5 py-3.5 sm:table-cell">
					<Badge variant={expense.tag ? 'default' : 'secondary'}>{expense.tag ?? 'Untagged'}</Badge>
				</Table.Cell>
				<Table.Cell class="text-muted-foreground hidden px-5 py-3.5 text-xs sm:table-cell">
					{formatDisplayDate(expense.expenseDate) ?? expense.expenseDate}
				</Table.Cell>
				<Table.Cell class="px-2 py-3.5 text-right font-medium tabular-nums sm:px-5">
					{formatCents(expense.amount)}
				</Table.Cell>
				<Table.Cell class="px-1 py-3.5 text-right sm:px-3">
					<ExpenseActions onAction={(action) => onAction(action, expense)} />
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
