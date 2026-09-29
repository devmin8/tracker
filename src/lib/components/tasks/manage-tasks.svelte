<script lang="ts">
	import type { Snippet } from 'svelte';

	import type { TaskAssignee } from '$lib/tasks/assignee';
	import type { DeletableTask, EditableTask, TaskItem } from '$lib/tasks/task-item';

	import type { TaskAction } from './task-actions';
	import DeleteTaskDialog from './delete-task-dialog.svelte';
	import UpdateTaskDialog from './update-task-dialog.svelte';

	type TaskManagerApi = {
		onTaskAction: (action: TaskAction, task: TaskItem) => void;
	};

	type Props = {
		children: Snippet<[TaskManagerApi]>;
		assignees: readonly TaskAssignee[];
	};

	let { children, assignees }: Props = $props();

	let editingTask = $state<EditableTask | undefined>();
	let deletingTask = $state<DeletableTask | undefined>();

	function onTaskAction(action: TaskAction, task: TaskItem) {
		if (action === 'delete') {
			deletingTask = task;
		} else if (action === 'update') {
			editingTask = task;
		}
	}
</script>

{@render children({ onTaskAction })}

<UpdateTaskDialog bind:task={editingTask} {assignees} />
<DeleteTaskDialog bind:task={deletingTask} />
