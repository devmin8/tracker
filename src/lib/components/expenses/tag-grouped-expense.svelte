<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import type { TagExpenseGroup } from '$lib/expenses';
	import { formatCents } from '$lib/utils/amount';

	type Props = {
		groups: TagExpenseGroup[];
		emptyMessage: string;
	};

	let { groups, emptyMessage }: Props = $props();
</script>

<Table.Root class="table-fixed" containerClass="min-h-0 flex-1 overflow-y-auto">
	<Table.Header sticky>
		<Table.Row>
			<Table.Head class="ps-4 pe-2 sm:w-3/5 sm:px-5">Tag</Table.Head>
			<Table.Head class="w-14 px-2 text-right sm:w-1/5 sm:px-5">Count</Table.Head>
			<Table.Head class="w-24 px-2 text-right sm:w-1/5 sm:px-5">Amount</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each groups as group (group.tag)}
			<Table.Row>
				<Table.Cell class="overflow-hidden ps-4 pe-2 py-3.5 sm:px-5">
					<Badge
						class="max-w-full min-w-0 overflow-hidden sm:text-[13px]"
						variant={group.tag ? 'default' : 'secondary'}
					>
						<span class="truncate">{group.tag ?? 'Untagged'}</span>
					</Badge>
				</Table.Cell>
				<Table.Cell
					class="text-muted-foreground px-2 py-3.5 text-right text-xs tabular-nums sm:px-5 sm:text-[13px]"
				>
					{group.count}
				</Table.Cell>
				<Table.Cell class="px-2 py-3.5 text-right font-medium tabular-nums sm:px-5">
					{formatCents(group.amount)}
				</Table.Cell>
			</Table.Row>
		{:else}
			<Table.Row>
				<Table.Cell colspan={3} class="text-muted-foreground px-5 py-8 text-center">
					{emptyMessage}
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
