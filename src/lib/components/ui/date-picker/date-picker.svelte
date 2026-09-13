<script lang="ts">
	import { parseDate, type DateValue } from '@internationalized/date';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { format } from 'date-fns';

	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils/cn';
	import { formatDateString } from '$lib/utils/date';

	type DatePickerProps = {
		/** A calendar date in `yyyy-MM-dd` form. */
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		id?: string;
		class?: string;
	};

	let {
		value = $bindable(''),
		placeholder = 'Select a date',
		disabled = false,
		id,
		class: className
	}: DatePickerProps = $props();

	let open = $state(false);

	const selectedDate = $derived.by(() => {
		const normalized = value ? formatDateString(value) : null;
		return normalized ? parseDate(normalized) : undefined;
	});

	const displayValue = $derived(
		selectedDate
			? format(new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day), 'MMM d, yyyy')
			: placeholder
	);

	function onValueChange(next: DateValue | undefined) {
		if (next) {
			value = next.toString();
		}
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger {id} {disabled}>
		{#snippet child({ props })}
			<Button
				{...props}
				type="button"
				variant="outline"
				class={cn(
					'w-full justify-between font-normal',
					!selectedDate && 'text-muted-foreground',
					className
				)}
			>
				{displayValue}
				<ChevronDownIcon class="text-muted-foreground size-4" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto overflow-hidden p-0" align="start">
		<Calendar type="single" value={selectedDate} {onValueChange} captionLayout="dropdown" />
	</Popover.Content>
</Popover.Root>
