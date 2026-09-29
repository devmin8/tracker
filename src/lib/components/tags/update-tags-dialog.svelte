<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';

	import * as Dialog from '$lib/components/ui/dialog';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	import UpdateTagsForm, { type UpdateTagsFailure } from './update-tags.svelte';
	import type { UpdateTagsInput } from './update-tags-form.schema';

	export type TaggableDescription = {
		refinedDescription: string;
		name: string | null;
	};

	type Props = {
		tagging: TaggableDescription | undefined;
	};

	let { tagging = $bindable() }: Props = $props();

	function setOpen(open: boolean) {
		if (open) return;
		tagging = undefined;
	}

	async function onsubmit(input: UpdateTagsInput): Promise<UpdateTagsFailure | void> {
		const target = tagging;

		const outcome = await request('/expenses/tags', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});

		if (outcome.ok) {
			const invalidated = await safeResolve(invalidateAll);
			if (tagging !== target) return;

			if (!invalidated.ok) {
				return { message: 'Tag saved, but the page could not be refreshed. Please try again.' };
			}

			tagging = undefined;
			toast.success('Tag updated');
			return;
		}

		if (tagging !== target) return;

		return {
			message:
				outcome.error.kind === 'network'
					? 'Unable to save the tag. Check your connection and try again.'
					: outcome.error.message
		};
	}
</script>

<Dialog.Root bind:open={() => tagging !== undefined, setOpen}>
	{#if tagging}
		{#key tagging}
			<UpdateTagsForm
				refinedDescription={tagging.refinedDescription}
				name={tagging.name}
				{onsubmit}
			/>
		{/key}
	{/if}
</Dialog.Root>
