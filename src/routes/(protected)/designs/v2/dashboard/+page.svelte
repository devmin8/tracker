<script lang="ts">
	import { resolve } from '$app/paths';

	import {
		ArrowDownRight,
		ArrowUpRight,
		CalendarDays,
		ChevronRight,
		Fuel,
		Plus,
		ReceiptText,
		ShoppingBag,
		Tag,
		Utensils,
		WalletCards
	} from '@lucide/svelte';

	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';

	type TagSpending = {
		name: string;
		amount: string;
		share: number;
		color: string;
		icon: typeof Utensils;
	};

	type LedgerRow = {
		label: string;
		amount: string;
	};

	type Transaction = {
		merchant: string;
		category: string;
		date: string;
		count: number;
		amount: string;
	};

	const tagSpending: TagSpending[] = [
		{ name: 'Food & dining', amount: '$12,480', share: 38, color: 'bg-teal-500', icon: Utensils },
		{ name: 'Shopping', amount: '$7,250', share: 22, color: 'bg-sky-500', icon: ShoppingBag },
		{ name: 'Transport', amount: '$4,860', share: 15, color: 'bg-amber-500', icon: Fuel },
		{ name: 'Untagged', amount: '$3,400', share: 10, color: 'bg-slate-500', icon: Tag }
	];

	const hasTagSpending = tagSpending.length > 0;

	const savingsLedger: LedgerRow[] = [
		{ label: 'Income', amount: '$64,000' },
		{ label: 'Spent', amount: '$32,780' },
		{ label: 'Saved', amount: '$31,220' }
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
		<div class="flex items-center gap-2">
			<Button variant="outline" class="bg-card">
				<CalendarDays />
				March 2025
			</Button>
			<Button>
				<Plus />
				Add expense
			</Button>
		</div>
	</section>

	<section class="grid gap-px overflow-hidden border bg-border sm:grid-cols-2 xl:grid-cols-4">
		<div class="bg-card p-5">
			<div class="flex items-start justify-between">
				<p class="text-muted-foreground text-sm font-medium">Spent this month</p>
				<ReceiptText class="text-muted-foreground size-4" />
			</div>
			<p class="mt-5 text-2xl font-semibold tracking-tight tabular-nums">$32,780</p>
			<div class="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
				<ArrowDownRight class="size-3.5" />
				<span>14% lower than February</span>
			</div>
		</div>
		<div class="bg-card p-5">
			<div class="flex items-start justify-between">
				<p class="text-muted-foreground text-sm font-medium">Available to spend</p>
				<WalletCards class="text-muted-foreground size-4" />
			</div>
			<p class="mt-5 text-2xl font-semibold tracking-tight tabular-nums">$28,540</p>
			<div class="mt-2 flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
				<ArrowUpRight class="size-3.5" />
				<span>$2,140 more than last month</span>
			</div>
		</div>
		<div class="bg-card p-5">
			<div class="flex items-start justify-between">
				<p class="text-muted-foreground text-sm font-medium">Budget allocated</p>
				<ArrowUpRight class="text-muted-foreground size-4" />
			</div>
			<p class="mt-5 text-2xl font-semibold tracking-tight tabular-nums">$64,000</p>
			<p class="text-muted-foreground mt-2 text-xs">Assigned across all categories</p>
		</div>
		<div class="bg-card p-5">
			<div class="flex items-start justify-between">
				<p class="text-muted-foreground text-sm font-medium">Savings rate</p>
				<ArrowUpRight class="text-muted-foreground size-4" />
			</div>
			<p class="mt-5 text-2xl font-semibold tracking-tight tabular-nums">48.8%</p>
			<p class="text-muted-foreground mt-2 text-xs">$31,220 set aside this month</p>
		</div>
	</section>

	<div class="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.85fr)]">
		{#if hasTagSpending}
			<section class="flex flex-col border bg-card p-4">
				<div class="flex items-baseline justify-between gap-4">
					<h2 class="font-semibold">Spending by tag</h2>
					<p class="text-muted-foreground text-sm tabular-nums">$32,780 · 51.2% of income</p>
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
			</section>
		{/if}

		<section class="flex flex-col border bg-card p-4">
			<div class="flex items-baseline justify-between gap-4">
				<h2 class="font-semibold">Total savings</h2>
				<p class="text-xl font-semibold tracking-tight tabular-nums">$31,220</p>
			</div>
			<div class="mt-4 grid grid-cols-3 gap-3">
				{#each savingsLedger as row (row.label)}
					<div class="min-w-0">
						<p class="text-muted-foreground text-xs">{row.label}</p>
						<p class="mt-0.5 truncate text-sm font-medium tabular-nums">{row.amount}</p>
					</div>
				{/each}
			</div>
			<div class="mt-4">
				<div class="mb-1.5 flex justify-between text-sm">
					<span class="font-medium">Savings rate</span>
					<span class="text-muted-foreground tabular-nums">48.8%</span>
				</div>
				<div class="h-1.5 bg-muted">
					<div class="h-full w-[49%] bg-primary"></div>
				</div>
			</div>
		</section>
	</div>

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
						<Table.Head class="px-5">Expense</Table.Head>
						<Table.Head class="px-5">Tag</Table.Head>
						<Table.Head class="px-5 text-center">Count</Table.Head>
						<Table.Head class="px-5 text-right">Amount</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each transactions as transaction (transaction.merchant)}
						<Table.Row>
							<Table.Cell class="px-5 py-3.5">
								<p class="truncate font-medium">{transaction.merchant}</p>
								<p class="text-muted-foreground mt-0.5 text-xs">{transaction.date}</p>
							</Table.Cell>
							<Table.Cell class="px-5 py-3.5">
								<Badge>{transaction.category}</Badge>
							</Table.Cell>
							<Table.Cell class="px-5 py-3.5 text-center tabular-nums"
								>{transaction.count}</Table.Cell
							>
							<Table.Cell class="px-5 py-3.5 text-right font-medium tabular-nums"
								>{transaction.amount}</Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</section>
</div>
