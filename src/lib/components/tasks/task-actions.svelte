<script lang="ts">
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';

	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import { taskActionItems, type TaskAction, type TaskActionItem } from './task-actions';

	type Props = {
		items?: TaskActionItem[];
		onAction: (action: TaskAction) => void;
	};

	let { items = taskActionItems, onAction }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="size-8">
				<span class="sr-only">Open menu</span>
				<EllipsisVerticalIcon />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-40">
		{#each items as item (item.action)}
			<DropdownMenu.Item variant={item.variant} onSelect={() => onAction(item.action)}>
				{item.label}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
