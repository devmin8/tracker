<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import {
		AllExpenses,
		GroupedExpense,
		groupExpenses,
		type ExpenseAction
	} from '$lib/components/expenses';
	import { UpdateTagsForm } from '$lib/components/tags';
	import type { UpdateTagsInput } from '$lib/components/tags/update-tags-form.schema';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { MonthPicker } from '$lib/components/ui/month-picker';
	import { Switch } from '$lib/components/ui/switch';
	import { formatCents } from '$lib/utils/amount';
	import { currentYearMonth } from '$lib/utils/date';
	import { request } from '$lib/utils/request';

	let { data } = $props();

	let grouped = $state(true);
	let taggingDescription = $state<string | undefined>();
	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();

	const total = $derived(data.expenses.reduce((sum, expense) => sum + expense.amount, 0));

	const groups = $derived(groupExpenses(data.expenses));

	function setMonth(month: string) {
		if (month === data.month) return;
		goto(resolve(`/expenses/list?month=${month}`), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	function onAction(action: ExpenseAction, target: { refinedDescription: string }) {
		if (action !== 'update-tags') return;
		taggingDescription = target.refinedDescription;
		errorMessage = undefined;
	}

	function setDialogOpen(open: boolean) {
		if (open) return;
		taggingDescription = undefined;
		errorMessage = undefined;
	}

	async function onsubmit(input: UpdateTagsInput) {
		submitting = true;
		errorMessage = undefined;

		const outcome = await request('/expenses/tags', {
			method: 'POST',
			body: new URLSearchParams({
				name: input.name,
				refinedDescription: input.refinedDescription
			})
		});

		if (outcome.ok) {
			taggingDescription = undefined;
			toast.success('Tag created');
		} else {
			errorMessage =
				outcome.error.kind === 'network'
					? 'Unable to save the tag. Check your connection and try again.'
					: outcome.error.message;
		}

		submitting = false;
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<span class="text-muted-foreground text-sm font-medium">Total expenses</span>
			<span class="text-2xl font-semibold tabular-nums">{formatCents(total)}</span>
		</div>
		<div class="flex items-center gap-3">
			<MonthPicker
				class="w-48"
				bind:value={() => data.month, setMonth}
				max={currentYearMonth()}
				ariaLabel="Month to view"
			/>
			<div class="flex items-center gap-2">
				<Switch id="group-expenses" bind:checked={grouped} />
				<Label for="group-expenses">Group expenses</Label>
			</div>
		</div>
	</div>

	{#if grouped}
		<GroupedExpense {groups} {onAction} />
	{:else}
		<AllExpenses expenses={data.expenses} {onAction} />
	{/if}
</div>

<Dialog.Root bind:open={() => taggingDescription !== undefined, setDialogOpen}>
	{#if taggingDescription}
		<UpdateTagsForm
			refinedDescription={taggingDescription}
			{submitting}
			{errorMessage}
			{onsubmit}
		/>
	{/if}
</Dialog.Root>
