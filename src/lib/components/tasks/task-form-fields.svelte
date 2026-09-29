<script lang="ts">
	import { DatePicker } from '$lib/components/ui/date-picker';
	import { Field, FieldLabel } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { toAssigneeOptions, type TaskAssignee } from '$lib/tasks/assignee';
	import { TASK_STATUS_OPTIONS, type TaskStatusOption } from '$lib/tasks/task-status';

	type Props = {
		assignees: readonly TaskAssignee[];
		name: string;
		dueOn: string;
		status: TaskStatusOption['value'];
		assignedTo: string;
		finishedAt?: string;
		showFinishedDate?: boolean;
	};

	let {
		assignees,
		name = $bindable(),
		dueOn = $bindable(),
		status = $bindable(),
		assignedTo = $bindable(),
		finishedAt = $bindable(),
		showFinishedDate = false
	}: Props = $props();

	const assigneeOptions = $derived(toAssigneeOptions(assignees));
</script>

<Field>
	<FieldLabel>Name</FieldLabel>
	<Input name="name" type="text" placeholder="Pay electricity bill" required bind:value={name} />
</Field>

<Field>
	<FieldLabel>Due date</FieldLabel>
	<DatePicker bind:value={dueOn} />
</Field>

<Field>
	<FieldLabel>Assign to</FieldLabel>
	<Select.Root type="single" bind:value={assignedTo} items={assigneeOptions}>
		<Select.Trigger class="w-full" aria-label="Task assignee">
			<Select.Value placeholder="Select an assignee" />
		</Select.Trigger>
		<Select.Content>
			{#each assigneeOptions as option (option.value)}
				<Select.Item value={option.value} label={option.label}>
					{option.label}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</Field>

<Field>
	<FieldLabel>Status</FieldLabel>
	<Select.Root type="single" bind:value={status} items={[...TASK_STATUS_OPTIONS]}>
		<Select.Trigger class="w-full" aria-label="Task status">
			<Select.Value placeholder="Select a status" />
		</Select.Trigger>
		<Select.Content>
			{#each TASK_STATUS_OPTIONS as option (option.value)}
				<Select.Item value={option.value} label={option.label}>
					{option.label}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</Field>

{#if showFinishedDate}
	<Field>
		<FieldLabel>Finished date</FieldLabel>
		<DatePicker bind:value={finishedAt} />
	</Field>
{/if}
