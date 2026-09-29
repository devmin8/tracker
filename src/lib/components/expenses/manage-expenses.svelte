<script lang="ts">
	import type { Snippet } from 'svelte';

	import { UpdateTagsDialog, type TaggableDescription } from '$lib/components/tags';
	import type { Expense, ExpenseGroup } from '$lib/expenses';

	import type { ExpenseAction } from './expense-actions';
	import DeleteExpenseDialog from './delete-expense-dialog.svelte';
	import UpdateExpenseDialog from './update-expense-dialog.svelte';

	type ExpenseManagerApi = {
		onExpenseAction: (action: ExpenseAction, expense: Expense) => void;
		onGroupAction: (action: ExpenseAction, group: ExpenseGroup) => void;
	};

	type Props = {
		children: Snippet<[ExpenseManagerApi]>;
	};

	let { children }: Props = $props();

	let editingExpense = $state<Expense | undefined>();
	let deletingExpense = $state<Expense | undefined>();
	let tagging = $state<TaggableDescription | undefined>();

	function openTagEditor(refinedDescription: string, name: string | null) {
		tagging = { refinedDescription, name };
	}

	function onExpenseAction(action: ExpenseAction, expense: Expense) {
		if (action === 'delete') {
			deletingExpense = expense;
		} else if (action === 'update-tags') {
			openTagEditor(expense.refinedDescription, expense.tag);
		} else if (action === 'update-expense') {
			editingExpense = expense;
		}
	}

	function onGroupAction(action: ExpenseAction, group: ExpenseGroup) {
		if (action !== 'update-tags') return;
		openTagEditor(group.refinedDescription, group.tag);
	}
</script>

{@render children({ onExpenseAction, onGroupAction })}

<UpdateTagsDialog bind:tagging />
<UpdateExpenseDialog bind:expense={editingExpense} />
<DeleteExpenseDialog bind:expense={deletingExpense} />
