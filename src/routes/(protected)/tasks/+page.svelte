<script lang="ts">
	import { Plus } from '@lucide/svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AddTaskDialog, ManageTasks, TaskActions, type TaskAction } from '$lib/components/tasks';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { TASK_FILTER_OPTIONS, type TaskFilter } from '$lib/tasks/task-list';
	import { displayTaskStatus } from '$lib/tasks/task-status';
	import { formatDisplayDate } from '$lib/utils/date';

	let { data } = $props();

	let addingTask = $state(false);

	const emptyMessage = $derived(
		data.status === 'all'
			? 'No tasks yet'
			: `No ${TASK_FILTER_OPTIONS.find((option) => option.value === data.status)?.label.toLowerCase() ?? ''} tasks`
	);

	const rangeStart = $derived(data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1);
	const rangeEnd = $derived(Math.min(data.page * data.pageSize, data.total));

	function setStatus(next: TaskFilter) {
		if (next === data.status) return;

		goto(resolve(`/tasks?status=${next}&page=1`), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	function setPage(nextPage: number) {
		if (nextPage === data.page) return;

		goto(resolve(`/tasks?status=${data.status}&page=${nextPage}`), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-4 border bg-card p-4">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-2">
			<span class="text-muted-foreground text-sm font-medium">Total :</span>
			<span class="text-xl font-semibold tabular-nums">{data.total}</span>
		</div>
		<div class="flex items-center gap-3">
			<Select.Root
				type="single"
				value={data.status}
				items={[...TASK_FILTER_OPTIONS]}
				onValueChange={(next) => {
					if (next) setStatus(next as TaskFilter);
				}}
			>
				<Select.Trigger class="w-44" aria-label="Filter tasks by status">
					<Select.Value placeholder="Filter by status" />
				</Select.Trigger>
				<Select.Content>
					{#each TASK_FILTER_OPTIONS as option (option.value)}
						<Select.Item value={option.value} label={option.label}>
							{option.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Button onclick={() => (addingTask = true)}>
				<Plus />
				Create Task
			</Button>
		</div>
	</div>

	<ManageTasks assignees={data.assignees}>
		{#snippet children({ onTaskAction })}
			<Table.Root class="table-fixed" containerClass="min-h-0 flex-1 overflow-y-auto">
				<Table.Header sticky>
					<Table.Row>
						<Table.Head class="ps-4 pe-2 sm:w-1/3 sm:px-5">Task</Table.Head>
						<Table.Head class="hidden px-5 sm:table-cell sm:w-1/6">Due</Table.Head>
						<Table.Head class="hidden px-5 sm:table-cell sm:w-1/6">Assignee</Table.Head>
						<Table.Head class="px-2 sm:w-1/6 sm:px-5">Status</Table.Head>
						<Table.Head class="hidden px-5 text-right sm:table-cell sm:w-1/10">Finished</Table.Head>
						<Table.Head class="w-10 px-1 sm:w-1/20 sm:px-3">
							<span class="sr-only">Actions</span>
						</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.tasks as task (task.id)}
						{@const display = displayTaskStatus(task.dueOn, task.status, data.today)}
						<Table.Row>
							<Table.Cell class="overflow-hidden ps-4 pe-2 py-3.5 sm:px-5">
								<p class="truncate font-medium text-xs sm:text-[15px]">
									{task.name}
								</p>
								<p class="text-muted-foreground mt-1 text-xs sm:hidden">
									{formatDisplayDate(task.dueOn) ?? task.dueOn}
								</p>
							</Table.Cell>
							<Table.Cell
								class="text-muted-foreground hidden px-5 py-3.5 text-xs sm:table-cell sm:text-[13px]"
							>
								{formatDisplayDate(task.dueOn) ?? task.dueOn}
							</Table.Cell>
							<Table.Cell
								class="text-muted-foreground hidden truncate px-5 py-3.5 text-xs sm:table-cell sm:text-[13px]"
							>
								{task.assigneeName ?? '—'}
							</Table.Cell>
							<Table.Cell class="px-2 py-3.5 sm:px-5">
								<Badge
									class="sm:text-[13px]"
									variant={display === 'Done'
										? 'default'
										: display === 'Open'
											? 'secondary'
											: 'destructive'}
								>
									{display}
								</Badge>
							</Table.Cell>
							<Table.Cell
								class="text-muted-foreground hidden px-5 py-3.5 text-right text-xs sm:table-cell sm:text-[13px]"
							>
								{task.finishedAt ? (formatDisplayDate(task.finishedAt) ?? task.finishedAt) : '—'}
							</Table.Cell>
							<Table.Cell class="px-1 py-3.5 text-right sm:px-3">
								<TaskActions onAction={(action: TaskAction) => onTaskAction(action, task)} />
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={6} class="text-muted-foreground px-5 py-8 text-center">
								{emptyMessage}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{/snippet}
	</ManageTasks>

	<div class="flex items-center justify-between gap-3">
		<p class="text-muted-foreground text-sm tabular-nums">
			Showing {rangeStart}–{rangeEnd} of {data.total}
		</p>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={data.page <= 1}
				onclick={() => setPage(data.page - 1)}
			>
				Prev
			</Button>
			<span class="text-muted-foreground text-sm tabular-nums">
				Page {data.page} of {data.pageCount}
			</span>
			<Button
				variant="outline"
				size="sm"
				disabled={data.page >= data.pageCount}
				onclick={() => setPage(data.page + 1)}
			>
				Next
			</Button>
		</div>
	</div>
</div>

<AddTaskDialog
	bind:open={addingTask}
	assignees={data.assignees}
	defaultAssigneeId={data.currentUserId}
/>
