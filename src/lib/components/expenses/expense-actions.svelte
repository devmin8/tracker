<script lang="ts">
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';

	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
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
		<DropdownMenu.Item variant="destructive">Delete</DropdownMenu.Item>
		<DropdownMenu.Item>Update tags</DropdownMenu.Item>
		<DropdownMenu.Item>Update expense</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
