<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { TaskAssignee } from '$lib/tasks/assignee';
	import type { EditableTask } from '$lib/tasks/task-item';
	import type { FormValues } from '$lib/utils/form';
	import { request } from '$lib/utils/request';

	import UpdateTaskForm from './update-task.svelte';

	type Props = {
		task: EditableTask | undefined;
		assignees: readonly TaskAssignee[];
	};

	let { task = $bindable(), assignees }: Props = $props();

	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();

	function setOpen(open: boolean) {
		if (open) return;
		task = undefined;
		errorMessage = undefined;
		submitting = false;
	}

	async function onsubmit(input: FormValues) {
		if (!task) return;

		const current = task;
		submitting = true;
		errorMessage = undefined;

		const outcome = await request<{ id: string }>(`/tasks/${current.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});

		if (outcome.ok) {
			await invalidateAll();
			task = undefined;
			toast.success('Task updated');
		} else {
			errorMessage =
				outcome.error.kind === 'network'
					? 'Unable to save the task. Check your connection and try again.'
					: outcome.error.message;
		}

		submitting = false;
	}
</script>

<Dialog.Root bind:open={() => task !== undefined, setOpen}>
	{#if task}
		<UpdateTaskForm {task} {assignees} {submitting} {errorMessage} {onsubmit} />
	{/if}
</Dialog.Root>
