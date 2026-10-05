<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { TaskAssignee } from '$lib/tasks/assignee';
	import type { FormValues } from '$lib/utils/form';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	import AddTaskForm from './add-task.svelte';

	type Props = {
		open?: boolean;
		assignees: readonly TaskAssignee[];
		defaultAssigneeId: string;
	};

	let { open = $bindable(false), assignees, defaultAssigneeId }: Props = $props();

	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();
	let dialogVersion = 0;

	function onOpenChange(next: boolean) {
		if (next) return;
		dialogVersion += 1;
		errorMessage = undefined;
		submitting = false;
	}

	async function onsubmit(input: FormValues) {
		if (submitting) return;
		const submittedVersion = dialogVersion;
		submitting = true;
		errorMessage = undefined;

		const outcome = await request('/tasks/add', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});

		const refreshed = outcome.ok ? await safeResolve(invalidateAll) : undefined;
		if (dialogVersion !== submittedVersion) return;
		submitting = false;

		if (!outcome.ok) {
			errorMessage =
				outcome.error.kind === 'network'
					? 'Unable to save the task. Check your connection and try again.'
					: outcome.error.message;
			return;
		}

		open = false;
		if (!refreshed?.ok) {
			toast.error('Task created, but the page could not be refreshed. Please reload the page.');
			return;
		}
		toast.success('Task created');
	}
</script>

<Dialog.Root bind:open {onOpenChange}>
	{#if open}
		<AddTaskForm {submitting} {errorMessage} {assignees} {defaultAssigneeId} {onsubmit} />
	{/if}
</Dialog.Root>
