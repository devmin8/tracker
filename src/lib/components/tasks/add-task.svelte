<script lang="ts">
	import * as v from 'valibot';

	import { CreateTaskSchema } from '$lib/schemas/create-task.schema';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FieldError, FieldGroup } from '$lib/components/ui/field';
	import { resolveDefaultAssignee, type TaskAssignee } from '$lib/tasks/assignee';
	import { type TaskStatusOption } from '$lib/tasks/task-status';
	import { todayIsoDate } from '$lib/utils/date';
	import type { FormValues } from '$lib/utils/form';

	import TaskFormFields from './task-form-fields.svelte';

	type Props = {
		submitting?: boolean;
		errorMessage?: string;
		assignees: readonly TaskAssignee[];
		defaultAssigneeId: string;
		onsubmit: (input: FormValues) => Promise<void>;
	};

	let {
		submitting = false,
		errorMessage,
		assignees,
		defaultAssigneeId,
		onsubmit
	}: Props = $props();

	let form: HTMLFormElement;
	let name = $state('');
	let dueOn = $state(todayIsoDate());
	let status = $state<TaskStatusOption['value']>('open');
	let assignedTo = $state('');
	let validationMessage = $state<string>();

	$effect.pre(() => {
		if (!assignedTo) assignedTo = resolveDefaultAssignee(assignees, defaultAssigneeId);
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const input = Object.fromEntries(new FormData(form));
		const result = v.safeParse(CreateTaskSchema, input);
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
		<Dialog.Title>Create task</Dialog.Title>
		<Dialog.Description>Save a single task with a name, due date, and status.</Dialog.Description>
	</Dialog.Header>
	<form bind:this={form} onsubmit={handleSubmit} class="flex flex-col gap-6">
		<input type="hidden" name="dueOn" value={dueOn} />
		<input type="hidden" name="status" value={status} />
		<input type="hidden" name="assignedTo" value={assignedTo} />

		<FieldGroup>
			{#if errorMessage ?? validationMessage}
				<FieldError errors={[{ message: errorMessage ?? validationMessage }]} />
			{/if}

			<TaskFormFields bind:name bind:dueOn bind:status bind:assignedTo {assignees} />
		</FieldGroup>

		<Dialog.Footer>
			<Button type="submit" class="w-full" disabled={submitting}>
				{submitting ? 'Saving…' : 'Save task'}
			</Button>
		</Dialog.Footer>
	</form>
</Dialog.Content>
