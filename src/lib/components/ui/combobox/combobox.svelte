<script lang="ts">
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';

	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils/cn';

	type ComboboxItem = {
		value: string;
		label: string;
	};

	type ComboboxProps = {
		value?: string;
		items: ComboboxItem[];
		placeholder?: string;
		searchPlaceholder?: string;
		emptyText?: string;
		disabled?: boolean;
		id?: string;
		class?: string;
	};

	let {
		value = $bindable(),
		items,
		placeholder = 'Select…',
		searchPlaceholder = 'Search…',
		emptyText = 'No results found.',
		disabled = false,
		id,
		class: className
	}: ComboboxProps = $props();

	let open = $state(false);
	let trigger = $state<HTMLButtonElement | null>(null);

	const selectedItem = $derived(items.find((item) => item.value === value));

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			trigger?.focus();
		});
	}

	function selectItem(item: ComboboxItem) {
		value = item.value;
		closeAndFocusTrigger();
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={trigger} {id} {disabled}>
		{#snippet child({ props })}
			<Button
				{...props}
				type="button"
				variant="outline"
				class={cn(
					'w-full justify-between font-normal',
					!selectedItem && 'text-muted-foreground',
					className
				)}
				role="combobox"
				aria-expanded={open}
			>
				{selectedItem?.label ?? placeholder}
				<ChevronsUpDownIcon class="opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-(--bits-popover-anchor-width) p-0" align="start">
		<Command.Root>
			<Command.Input placeholder={searchPlaceholder} />
			<Command.List>
				<Command.Empty>{emptyText}</Command.Empty>
				<Command.Group>
					{#each items as item (item.value)}
						<Command.Item
							value={item.value}
							keywords={[item.label]}
							data-checked={value === item.value ? true : undefined}
							onSelect={() => selectItem(item)}
						>
							{item.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
