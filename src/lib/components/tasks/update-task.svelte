<script lang="ts">
	import * as v from 'valibot';

	import { UpdateTaskSchema } from '$lib/schemas/update-task.schema';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FieldError, FieldGroup } from '$lib/components/ui/field';
	import type { TaskAssignee } from '$lib/tasks/assignee';
	import type { EditableTask } from '$lib/tasks/task-item';
	import type { TaskStatusOption } from '$lib/tasks/task-status';
	import { todayIsoDate } from '$lib/utils/date';
	import type { FormValues } from '$lib/utils/form';

	import TaskFormFields from './task-form-fields.svelte';

	type Props = {
		task: EditableTask;
		assignees: readonly TaskAssignee[];
		submitting?: boolean;
		errorMessage?: string;
		onsubmit: (input: FormValues) => Promise<void>;
	};

	let { task, assignees, submitting = false, errorMessage, onsubmit }: Props = $props();

	let form: HTMLFormElement;
	let name = $derived(task.name);
	let dueOn = $derived(task.dueOn);
	let status = $derived<TaskStatusOption['value']>(task.status);
	let assignedTo = $derived(task.assignedTo);
	let finishedAt = $derived(task.finishedAt ?? todayIsoDate());
	let validationMessage = $state<string>();

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const input = Object.fromEntries(new FormData(form));
		const result = v.safeParse(UpdateTaskSchema, input);
		if (!result.success) {
			validationMessage = result.issues[0]?.message ?? 'Please check the task details';
			return;
		}

		validationMessage = undefined;
		await onsubmit(input);
	}
</script>

<Dialog.Content class="sm:max-w-sm">
	<Dialog.Header>
		<Dialog.Title>Update task</Dialog.Title>
		<Dialog.Description
			>Change the name, due date, assignee, status, or finished date for this task.</Dialog.Description
		>
	</Dialog.Header>
	<form bind:this={form} onsubmit={handleSubmit} class="flex flex-col gap-6">
		<input type="hidden" name="dueOn" value={dueOn} />
		<input type="hidden" name="status" value={status} />
		<input type="hidden" name="assignedTo" value={assignedTo} />
		<input type="hidden" name="finishedAt" value={status === 'done' ? finishedAt : ''} />

		<FieldGroup>
			{#if errorMessage ?? validationMessage}
				<FieldError errors={[{ message: errorMessage ?? validationMessage }]} />
			{/if}

			<TaskFormFields
				bind:name
				bind:dueOn
				bind:status
				bind:assignedTo
				bind:finishedAt
				showFinishedDate={status === 'done'}
				{assignees}
			/>
		</FieldGroup>

		<Dialog.Footer>
			<Button type="submit" class="w-full" disabled={submitting}>
				{submitting ? 'Saving…' : 'Save changes'}
			</Button>
		</Dialog.Footer>
	</form>
</Dialog.Content>
