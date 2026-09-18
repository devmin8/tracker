<script lang="ts">
	import { ArrowDownRight, CalendarDays, ChevronRight, Plus, ReceiptText } from '@lucide/svelte';

	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';

	type TagSpending = {
		name: string;
		amount: string;
		share: number;
		color: string;
	};

	type Transaction = {
		merchant: string;
		category: string;
		date: string;
		count: number;
		amount: string;
	};

	const tagSpending: TagSpending[] = [
		{ name: 'Food & dining', amount: '$12,480', share: 38, color: 'bg-teal-500' },
		{ name: 'Shopping', amount: '$7,250', share: 22, color: 'bg-sky-500' },
		{ name: 'Transport', amount: '$4,860', share: 15, color: 'bg-amber-500' },
		{ name: 'Untagged', amount: '$3,400', share: 10, color: 'bg-slate-500' }
	];

	const transactions: Transaction[] = [
		{
			merchant: 'Uber eats',
			category: 'Food & dining',
			date: 'Today, 1:24 PM',
			count: 2,
			amount: '$486'
		},
		{
			merchant: 'Amazon',
			category: 'Shopping',
			date: 'Yesterday, 8:42 PM',
			count: 1,
			amount: '$1,249'
		},
		{
			merchant: 'Fuel',
			category: 'Transport',
			date: 'Yesterday, 10:15 AM',
			count: 1,
			amount: '$2,000'
		},
		{
			merchant: 'Spotify',
			category: 'Entertainment',
			date: 'Mar 24, 2025',
			count: 1,
			amount: '$119'
		},
		{
			merchant: 'Rent',
			category: 'Home',
			date: 'Mar 24, 2025',
			count: 1,
			amount: '$18,000'
		}
	];
</script>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-6">
	<section class="flex justify-end">
		<div class="flex flex-wrap justify-end gap-2">
			<Button variant="outline" class="shrink-0 bg-card">
				<CalendarDays />
				March 2025
			</Button>
			<Button class="shrink-0">
				<Plus />
				Add expense
			</Button>
		</div>
	</section>

	<section class="grid gap-px overflow-hidden border bg-border sm:grid-cols-[20rem_minmax(0,1fr)]">
		<div class="flex flex-col bg-card p-5 sm:h-full">
			<div class="flex items-start justify-between">
				<p class="text-muted-foreground text-sm font-medium">Spent this month</p>
				<ReceiptText class="text-muted-foreground size-4" />
			</div>
			<p class="mt-5 text-2xl font-semibold tracking-tight tabular-nums sm:my-auto">$32,780</p>
			<div class="text-muted-foreground mt-2 flex items-center gap-1 text-xs sm:mt-0">
				<ArrowDownRight class="size-3.5" />
				<span>14% lower than February</span>
			</div>
		</div>
		<div class="min-w-0 bg-card p-5">
			<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
				<h2 class="font-semibold">Spending by tag</h2>
				<p class="text-sm font-medium tabular-nums">$32,780</p>
			</div>
			<div class="mt-3 flex h-1.5 overflow-hidden bg-muted" aria-label="Spending by tag">
				{#each tagSpending as tag (tag.name)}
					<div class={tag.color} style={`width: ${tag.share}%`}></div>
				{/each}
				<div class="flex-1 bg-slate-300 dark:bg-slate-700"></div>
			</div>
			<div class="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
				{#each tagSpending as tag (tag.name)}
					<div class="flex min-w-0 items-center gap-2.5">
						<span class="min-w-0 flex-1 truncate text-sm">{tag.name}</span>
						<span class="text-muted-foreground w-8 shrink-0 text-right text-xs tabular-nums"
							>{tag.share}%</span
						>
						<span class="w-19 shrink-0 text-right text-sm font-medium tabular-nums"
							>{tag.amount}</span
						>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="flex flex-col gap-3 pt-4">
		<div class="flex items-end justify-between gap-4">
			<div>
				<h2 class="font-semibold">Recent expenses</h2>
				<p class="text-muted-foreground mt-0.5 text-sm">Your latest recorded transactions</p>
			</div>
			<a
				href={resolve('/expenses/list')}
				class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
			>
				View all <ChevronRight class="size-4" />
			</a>
		</div>
		<div class="border bg-card">
			<Table.Root>
				<Table.Header>
					<Table.Row class="hover:bg-transparent">
						<Table.Head class="px-4 sm:px-5">Expense</Table.Head>
						<Table.Head class="hidden px-5 sm:table-cell">Tag</Table.Head>
						<Table.Head class="hidden px-5 text-center sm:table-cell">Count</Table.Head>
						<Table.Head class="px-4 text-right sm:px-5">Amount</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each transactions as transaction (transaction.merchant)}
						<Table.Row>
							<Table.Cell class="max-w-0 px-4 py-3.5 sm:px-5">
								<p class="truncate font-medium">{transaction.merchant}</p>
								<p class="text-muted-foreground mt-0.5 text-xs">{transaction.date}</p>
								<div class="mt-2 sm:hidden">
									<Badge>{transaction.category}</Badge>
								</div>
							</Table.Cell>
							<Table.Cell class="hidden px-5 py-3.5 sm:table-cell">
								<Badge>{transaction.category}</Badge>
							</Table.Cell>
							<Table.Cell class="hidden px-5 py-3.5 text-center tabular-nums sm:table-cell"
								>{transaction.count}</Table.Cell
							>
							<Table.Cell class="px-4 py-3.5 text-right font-medium tabular-nums sm:px-5"
								>{transaction.amount}</Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</section>
</div>
