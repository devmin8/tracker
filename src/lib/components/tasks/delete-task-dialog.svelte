<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FieldError } from '$lib/components/ui/field';
	import type { DeletableTask } from '$lib/tasks/task-item';
	import { formatDisplayDate } from '$lib/utils/date';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	type Props = {
		task: DeletableTask | undefined;
	};

	let { task = $bindable() }: Props = $props();

	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();

	function setOpen(open: boolean) {
		if (open) return;
		task = undefined;
		errorMessage = undefined;
		submitting = false;
	}

	async function confirmDelete() {
		if (!task || submitting) return;

		const current = task;
		submitting = true;
		errorMessage = undefined;

		const outcome = await request(`/tasks/${current.id}`, {
			method: 'DELETE'
		});

		const refreshed = outcome.ok ? await safeResolve(invalidateAll) : undefined;
		if (task !== current) return;
		submitting = false;

		if (!outcome.ok) {
			errorMessage =
				outcome.error.kind === 'network'
					? 'Unable to delete the task. Check your connection and try again.'
					: outcome.error.message;
			return;
		}

		task = undefined;
		if (!refreshed?.ok) {
			toast.error('Task deleted, but the page could not be refreshed. Please reload the page.');
			return;
		}

		toast.success('Task deleted');
	}
</script>

<Dialog.Root bind:open={() => task !== undefined, setOpen}>
	{#if task}
		<Dialog.Content class="sm:max-w-sm">
			<Dialog.Header>
				<Dialog.Title>Delete task</Dialog.Title>
				<Dialog.Description>
					This will archive {task.name} (due {formatDisplayDate(task.dueOn) ?? task.dueOn}) and hide
					it from your list.
				</Dialog.Description>
			</Dialog.Header>

			{#if errorMessage}
				<FieldError errors={[{ message: errorMessage }]} />
			{/if}

			<Dialog.Footer>
				<Button variant="outline" onclick={() => setOpen(false)} disabled={submitting}>
					Cancel
				</Button>
				<Button variant="destructive" onclick={confirmDelete} disabled={submitting}>
					{submitting ? 'Deleting…' : 'Delete'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	{/if}
</Dialog.Root>
