<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { TaskAssignee } from '$lib/tasks/assignee';
	import type { FormValues } from '$lib/utils/form';
	import { request } from '$lib/utils/request';

	import AddTaskForm from './add-task.svelte';

	type Props = {
		open?: boolean;
		assignees: readonly TaskAssignee[];
		defaultAssigneeId: string;
	};

	let { open = $bindable(false), assignees, defaultAssigneeId }: Props = $props();

	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();

	function onOpenChange(next: boolean) {
		if (!next) errorMessage = undefined;
	}

	async function onsubmit(input: FormValues) {
		submitting = true;
		errorMessage = undefined;

		const outcome = await request<{ id: string }>('/tasks/add', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});

		if (outcome.ok) {
			await invalidateAll();
			open = false;
			toast.success('Task created');
		} else {
			errorMessage =
				outcome.error.kind === 'network'
					? 'Unable to save the task. Check your connection and try again.'
					: outcome.error.message;
		}

		submitting = false;
	}
</script>

<Dialog.Root bind:open {onOpenChange}>
	{#if open}
		<AddTaskForm {submitting} {errorMessage} {assignees} {defaultAssigneeId} {onsubmit} />
	{/if}
</Dialog.Root>
