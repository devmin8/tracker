<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import { formatCents } from '$lib/utils/amount';
	import { currentYearMonthParts, formatYearMonth, MONTH_NAMES } from '$lib/utils/date';

	let { data } = $props();

	const currentYear = currentYearMonthParts().year;

	function setYear(year: number) {
		if (year === data.year) return;

		goto(resolve(`/reports/yearly?year=${year}`), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	function monthExpensesUrl(month: number) {
		return resolve(`/expenses/list?month=${formatYearMonth({ year: data.year, month })}`);
	}
</script>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-6">
	<section class="flex flex-wrap items-center justify-between gap-3 py-2">
		<div class="flex items-center gap-2">
			<span class="text-muted-foreground text-sm font-medium">Total :</span>
			<span class="text-xl font-semibold tabular-nums">{formatCents(data.total)}</span>
		</div>
		<div class="flex items-center gap-1 border bg-card p-0.5">
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label="Previous year"
				onclick={() => setYear(data.year - 1)}
			>
				<ChevronLeft />
			</Button>
			<span class="w-12 text-center text-sm font-semibold tabular-nums">{data.year}</span>
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label="Next year"
				disabled={data.year >= currentYear}
				onclick={() => setYear(data.year + 1)}
			>
				<ChevronRight />
			</Button>
		</div>
	</section>

	{#if data.months.length > 0}
		<section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each data.months as report (report.month)}
				<a
					href={monthExpensesUrl(report.month)}
					class="flex flex-col border bg-card transition-colors hover:border-primary/40"
				>
					<div class="flex items-baseline justify-between gap-3 border-b p-4">
						<h2 class="font-medium">{MONTH_NAMES[report.month - 1]}</h2>
						<p class="text-lg font-semibold tabular-nums">{formatCents(report.total)}</p>
					</div>
					<ol class="flex flex-col gap-2.5 p-4">
						{#each report.topTags as tag (tag.tag)}
							<li class="flex min-w-0 items-center gap-3 text-sm">
								<span class="min-w-0 truncate">{tag.tag ?? 'Untagged'}</span>
								<span class="text-muted-foreground ml-auto shrink-0 font-medium tabular-nums">
									{formatCents(tag.amount)}
								</span>
							</li>
						{/each}
					</ol>
				</a>
			{/each}
		</section>
	{:else}
		<p class="text-muted-foreground border bg-card px-5 py-8 text-center text-sm">
			No expenses recorded in {data.year}.
		</p>
	{/if}
</div>
