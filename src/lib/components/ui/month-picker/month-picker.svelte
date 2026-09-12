<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Popover as PopoverPrimitive } from 'bits-ui';

	import { cn } from '$lib/utils/cn';
	import {
		compareYearMonths,
		currentYearMonthParts,
		formatYearMonth,
		MONTH_NAMES,
		MONTH_NAMES_SHORT,
		parseYearMonth
	} from '$lib/utils/date';

	type MonthPickerProps = {
		/** A calendar month in `yyyy-MM` form. */
		value?: string;
		/** The earliest selectable calendar month, in `yyyy-MM` form. */
		min?: string;
		/** The latest selectable calendar month, in `yyyy-MM` form. */
		max?: string;
		placeholder?: string;
		id?: string;
		ariaLabel?: string;
		class?: string;
		disabled?: boolean;
	};

	let {
		value = $bindable(''),
		min,
		max,
		placeholder = 'Select month',
		id,
		ariaLabel,
		class: className,
		disabled = false
	}: MonthPickerProps = $props();

	let open = $state(false);
	let viewYear = $state(parseYearMonth(value)?.year ?? currentYearMonthParts().year);
	let contentEl = $state<HTMLElement | null>(null);

	const selected = $derived(parseYearMonth(value));
	const minBound = $derived(parseYearMonth(min));
	const maxBound = $derived(parseYearMonth(max));
	const displayValue = $derived(
		selected ? `${MONTH_NAMES[selected.month - 1]} ${selected.year}` : placeholder
	);
	const canGoToPreviousYear = $derived(!minBound || viewYear > minBound.year);
	const canGoToNextYear = $derived(!maxBound || viewYear < maxBound.year);

	function isOutOfRange(year: number, month: number) {
		const candidate = { year, month };
		return Boolean(
			(minBound && compareYearMonths(candidate, minBound) < 0) ||
			(maxBound && compareYearMonths(candidate, maxBound) > 0)
		);
	}

	function onOpenChange(isOpen: boolean) {
		if (isOpen) {
			viewYear = selected?.year ?? currentYearMonthParts().year;
		}
	}

	function onOpenAutoFocus(event: Event) {
		const selectedMonth = contentEl?.querySelector<HTMLElement>('[data-selected]');
		const firstEnabled = contentEl?.querySelector<HTMLElement>('[data-month]:not(:disabled)');
		const target = selectedMonth ?? firstEnabled;
		if (!target) return;

		event.preventDefault();
		target.focus();
	}

	function selectMonth(month: number) {
		if (isOutOfRange(viewYear, month)) return;

		value = formatYearMonth({ year: viewYear, month });
		open = false;
	}

	function isCurrentMonthDisabled() {
		const current = currentYearMonthParts();
		return isOutOfRange(current.year, current.month);
	}

	function jumpToCurrentMonth() {
		const current = currentYearMonthParts();
		if (isOutOfRange(current.year, current.month)) return;

		value = formatYearMonth(current);
		viewYear = current.year;
		open = false;
	}
</script>

<PopoverPrimitive.Root bind:open {onOpenChange}>
	<PopoverPrimitive.Trigger
		data-slot="month-picker-trigger"
		{id}
		aria-label={ariaLabel}
		class={cn(
			'border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-expanded:bg-accent flex h-9 w-full items-center justify-between rounded-md border px-3 text-left text-sm shadow-xs transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
			!selected && 'text-muted-foreground',
			className
		)}
		{disabled}
	>
		<span class="truncate">{displayValue}</span>
		<ChevronRightIcon class="text-muted-foreground size-4 rotate-90" aria-hidden="true" />
	</PopoverPrimitive.Trigger>

	<PopoverPrimitive.Portal>
		<PopoverPrimitive.Content
			bind:ref={contentEl}
			data-slot="month-picker-content"
			sideOffset={8}
			class="bg-popover text-popover-foreground z-50 w-(--bits-popover-anchor-width) rounded-lg border p-2.5 shadow-md outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
			{onOpenAutoFocus}
		>
			<div class="flex items-center justify-between">
				<button
					type="button"
					class="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex size-7 items-center justify-center rounded-md outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50"
					aria-label="Previous year"
					disabled={!canGoToPreviousYear}
					onclick={() => (viewYear -= 1)}
				>
					<ChevronLeftIcon class="size-4" aria-hidden="true" />
				</button>
				<div class="text-sm font-semibold tabular-nums">{viewYear}</div>
				<button
					type="button"
					class="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex size-7 items-center justify-center rounded-md outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50"
					aria-label="Next year"
					disabled={!canGoToNextYear}
					onclick={() => (viewYear += 1)}
				>
					<ChevronRightIcon class="size-4" aria-hidden="true" />
				</button>
			</div>

			<div class="mt-2 grid grid-cols-3 gap-1" aria-label={`Months in ${viewYear}`}>
				{#each MONTH_NAMES_SHORT as label, index (index)}
					{@const month = index + 1}
					{@const isSelected = selected?.year === viewYear && selected.month === month}
					<button
						type="button"
						data-month={month}
						data-selected={isSelected ? true : undefined}
						aria-label={`${MONTH_NAMES[index]} ${viewYear}`}
						aria-current={isSelected ? 'true' : undefined}
						disabled={isOutOfRange(viewYear, month)}
						class={cn(
							'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 flex h-8 items-center justify-center rounded-md text-sm font-medium outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-40',
							isSelected &&
								'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
						)}
						onclick={() => selectMonth(month)}
					>
						{label}
					</button>
				{/each}
			</div>

			<div class="border-border mt-2 border-t pt-1.5">
				<button
					type="button"
					class="text-primary hover:bg-accent focus-visible:ring-ring/50 flex h-7 w-full items-center justify-center rounded-md text-sm font-medium outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50"
					disabled={isCurrentMonthDisabled()}
					onclick={jumpToCurrentMonth}
				>
					Current month
				</button>
			</div>
		</PopoverPrimitive.Content>
	</PopoverPrimitive.Portal>
</PopoverPrimitive.Root>
