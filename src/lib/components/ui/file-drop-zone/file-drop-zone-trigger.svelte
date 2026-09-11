<script lang="ts">
	import UploadIcon from '@lucide/svelte/icons/upload';

	import { cn } from '$lib/utils/cn';

	import { useFileDropZoneTrigger } from './file-drop-zone.svelte.ts';
	import { displaySize } from './index';
	import type { FileDropZoneTriggerProps } from './types';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: FileDropZoneTriggerProps = $props();

	const triggerState = useFileDropZoneTrigger();
	const maxFiles = $derived(triggerState.rootState.opts.maxFiles.current);
	const maxFileSize = $derived(triggerState.rootState.opts.maxFileSize.current);
	const singleFile = $derived(maxFiles === 1);
</script>

<label
	bind:this={ref}
	class={cn('group/file-drop-zone-trigger', className)}
	{...triggerState.props}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<div
			class="hover:bg-accent/25 flex flex-col place-items-center justify-center gap-2 rounded-lg border border-dashed p-4 transition-all group-aria-disabled/file-drop-zone-trigger:opacity-50 hover:cursor-pointer group-aria-disabled/file-drop-zone-trigger:hover:cursor-not-allowed"
		>
			<div
				class="border-border text-muted-foreground flex size-10 place-items-center justify-center rounded-full border border-dashed"
			>
				<UploadIcon class="size-5" />
			</div>
			<div class="flex flex-col gap-0.5 text-center">
				<span class="text-muted-foreground text-sm font-medium">
					{#if singleFile}
						Drag 'n' drop a file here, or click to select a file
					{:else}
						Drag 'n' drop files here, or click to select files
					{/if}
				</span>
				{#if maxFiles || maxFileSize}
					<span class="text-muted-foreground/75 text-sm">
						{#if maxFiles}
							<span>
								You can upload {maxFiles} {maxFiles === 1 ? 'file' : 'files'}
							</span>
						{/if}
						{#if maxFiles && maxFileSize}
							<span>
								(up to {displaySize(maxFileSize)}{maxFiles === 1 ? '' : ' each'})
							</span>
						{/if}
						{#if maxFileSize && !maxFiles}
							<span>
								Maximum size {displaySize(maxFileSize)}
							</span>
						{/if}
					</span>
				{/if}
			</div>
		</div>
	{/if}
</label>
