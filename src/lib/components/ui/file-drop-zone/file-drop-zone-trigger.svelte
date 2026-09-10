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
					Drag 'n' drop files here, or click to select files
				</span>
				{#if triggerState.rootState.opts.maxFiles.current || triggerState.rootState.opts.maxFileSize.current}
					<span class="text-muted-foreground/75 text-sm">
						{#if triggerState.rootState.opts.maxFiles.current}
							<span>
								You can upload {triggerState.rootState.opts.maxFiles.current} files
							</span>
						{/if}
						{#if triggerState.rootState.opts.maxFiles.current && triggerState.rootState.opts.maxFileSize.current}
							<span>
								(up to {displaySize(triggerState.rootState.opts.maxFileSize.current)} each)
							</span>
						{/if}
						{#if triggerState.rootState.opts.maxFileSize.current && !triggerState.rootState.opts.maxFiles.current}
							<span>
								Maximum size {displaySize(triggerState.rootState.opts.maxFileSize.current)}
							</span>
						{/if}
					</span>
				{/if}
			</div>
		</div>
	{/if}
</label>
