<script lang="ts">
	import { resolve } from '$app/paths';

	import {
		ArrowDownRight,
		ArrowUpRight,
		CalendarDays,
		ChevronRight,
		Coffee,
		Ellipsis,
		Fuel,
		House,
		Plus,
		ReceiptText,
		ShoppingBag,
		Utensils,
		WalletCards
	} from '@lucide/svelte';

	import { Button } from '$lib/components/ui/button';

	type Category = {
		name: string;
		amount: string;
		share: number;
		color: string;
		icon: typeof Utensils;
	};

	type Transaction = {
		merchant: string;
		category: string;
		date: string;
		amount: string;
		icon: typeof Utensils;
		iconClass: string;
	};

	const categories: Category[] = [
		{ name: 'Food & dining', amount: '$12,480', share: 38, color: 'bg-teal-500', icon: Utensils },
		{ name: 'Shopping', amount: '$7,250', share: 22, color: 'bg-sky-500', icon: ShoppingBag },
		{ name: 'Transport', amount: '$4,860', share: 15, color: 'bg-amber-500', icon: Fuel },
		{ name: 'Home', amount: '$3,400', share: 10, color: 'bg-violet-500', icon: House }
	];

	const transactions: Transaction[] = [
		{
			merchant: 'Uber eats',
			category: 'Food & dining',
			date: 'Today, 1:24 PM',
			amount: '− $486',
			icon: Utensils,
			iconClass: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400'
		},
		{
			merchant: 'Amazon',
			category: 'Shopping',
			date: 'Yesterday, 8:42 PM',
			amount: '− $1,249',
			icon: ShoppingBag,
			iconClass: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
		},
		{
			merchant: 'Fuel',
			category: 'Transport',
			date: 'Yesterday, 10:15 AM',
			amount: '− $2,000',
			icon: Fuel,
			iconClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
		},
		{
			merchant: 'Spotify',
			category: 'Entertainment',
			date: 'Mar 24, 2025',
			amount: '− $119',
			icon: Coffee,
			iconClass: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
		}
	];
</script>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-6">
	<section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p class="text-muted-foreground text-sm">Monday, March 31</p>
			<h1 class="mt-1 text-2xl font-semibold tracking-tight">Good afternoon, Shanmugharaj.</h1>
			<p class="text-muted-foreground mt-1 text-sm">
				Here’s a clear look at your money this month.
			</p>
		</div>
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
				<p class="text-muted-foreground text-sm font-medium">Monthly income</p>
				<ArrowUpRight class="text-muted-foreground size-4" />
			</div>
			<p class="mt-5 text-2xl font-semibold tracking-tight tabular-nums">$64,000</p>
			<p class="text-muted-foreground mt-2 text-xs">Salary received on Mar 1</p>
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

	<div class="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.85fr)]">
		<section class="border bg-card">
			<div class="flex items-center justify-between border-b px-5 py-4">
				<div>
					<h2 class="font-semibold">Spending overview</h2>
					<p class="text-muted-foreground mt-0.5 text-sm">Where your money went in March</p>
				</div>
				<button
					class="text-muted-foreground hover:text-foreground grid size-8 place-items-center"
					aria-label="More spending options"
				>
					<Ellipsis class="size-4" />
				</button>
			</div>
			<div class="p-5">
				<div class="mb-6 flex items-end justify-between">
					<div>
						<p class="text-muted-foreground text-sm">Total spending</p>
						<p class="mt-1 text-3xl font-semibold tracking-tight tabular-nums">$32,780</p>
					</div>
					<p class="text-muted-foreground text-sm">51.2% of income</p>
				</div>
				<div class="flex h-2 overflow-hidden bg-muted" aria-label="Spending category breakdown">
					{#each categories as category (category.name)}
						<div class={category.color} style={`width: ${category.share}%`}></div>
					{/each}
					<div class="flex-1 bg-slate-300 dark:bg-slate-700"></div>
				</div>
				<div class="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
					{#each categories as category (category.name)}
						<div class="flex items-center gap-3">
							<div class="grid size-8 place-items-center bg-muted">
								<category.icon class="size-4 text-muted-foreground" />
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex justify-between gap-3 text-sm">
									<span class="font-medium">{category.name}</span>
									<span class="tabular-nums">{category.amount}</span>
								</div>
								<div class="text-muted-foreground mt-1 text-xs">{category.share}% of spending</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<section class="border bg-card">
			<div class="border-b px-5 py-4">
				<h2 class="font-semibold">This month’s plan</h2>
				<p class="text-muted-foreground mt-0.5 text-sm">Keep an eye on upcoming payments</p>
			</div>
			<div class="divide-y">
				<div class="flex items-center gap-3 p-4">
					<div
						class="grid size-9 place-items-center bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
					>
						<House class="size-4" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-sm font-medium">Rent</p>
						<p class="text-muted-foreground text-xs">Due tomorrow</p>
					</div>
					<p class="text-sm font-medium tabular-nums">$18,000</p>
				</div>
				<div class="flex items-center gap-3 p-4">
					<div
						class="grid size-9 place-items-center bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
					>
						<ReceiptText class="size-4" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-sm font-medium">Internet bill</p>
						<p class="text-muted-foreground text-xs">Due Apr 4</p>
					</div>
					<p class="text-sm font-medium tabular-nums">$999</p>
				</div>
				<div class="p-4">
					<div class="mb-2 flex justify-between text-sm">
						<span class="font-medium">Monthly budget</span><span
							class="text-muted-foreground tabular-nums">$32,780 / $45,000</span
						>
					</div>
					<div class="h-1.5 bg-muted"><div class="h-full w-[73%] bg-primary"></div></div>
					<p class="text-muted-foreground mt-2 text-xs">$12,220 remaining for the month</p>
				</div>
			</div>
		</section>
	</div>

	<section class="border bg-card">
		<div class="flex items-center justify-between border-b px-5 py-4">
			<div>
				<h2 class="font-semibold">Recent expenses</h2>
				<p class="text-muted-foreground mt-0.5 text-sm">Your latest recorded transactions</p>
			</div>
			<a
				href={resolve('/expenses/list')}
				class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
				>View all <ChevronRight class="size-4" /></a
			>
		</div>
		<div class="divide-y">
			{#each transactions as transaction (transaction.merchant)}
				<div class="flex items-center gap-3 px-5 py-3.5">
					<div class={`grid size-9 shrink-0 place-items-center ${transaction.iconClass}`}>
						<transaction.icon class="size-4" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium">{transaction.merchant}</p>
						<p class="text-muted-foreground mt-0.5 text-xs">
							{transaction.category} · {transaction.date}
						</p>
					</div>
					<p class="text-sm font-medium tabular-nums">{transaction.amount}</p>
				</div>
			{/each}
		</div>
	</section>
</div>
