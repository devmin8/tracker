<script lang="ts">
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { Portal } from 'bits-ui';
	import { box, mergeProps } from 'svelte-toolbelt';

	import { cn } from '$lib/utils/cn';

	import { useFileDropZoneDragOverlay } from './file-drop-zone.svelte.ts';
	import type { FileDropZoneDragOverlayProps } from './types';

	let {
		ref = $bindable(null),
		class: className,
		disabled = false,
		portalProps,
		children,
		...rest
	}: FileDropZoneDragOverlayProps = $props();

	const dragOverlayState = useFileDropZoneDragOverlay({
		disabled: box.with(() => disabled)
	});

	const mergedProps = $derived(mergeProps(dragOverlayState.props, rest));
</script>

<svelte:window
	ondragenter={dragOverlayState.windowProps.ondragenter}
	ondragleave={dragOverlayState.windowProps.ondragleave}
	ondragover={dragOverlayState.windowProps.ondragover}
	ondragend={dragOverlayState.windowProps.ondragend}
	ondrop={dragOverlayState.windowProps.ondrop}
/>

{#if dragOverlayState.dragging}
	<Portal {...portalProps}>
		<div
			bind:this={ref}
			class={cn(
				'animate-in fade-in-0 fixed inset-0 z-50 flex place-items-center justify-center bg-black/25 p-6 duration-100 supports-backdrop-filter:backdrop-blur-xs',
				className
			)}
			{...mergedProps}
		>
			{#if children}
				{@render children()}
			{:else}
				<div class="text-foreground flex flex-col place-items-center justify-center gap-3">
					<UploadIcon class="size-8" />
					<span class="text-lg font-medium">
						{#if dragOverlayState.rootState.opts.maxFiles.current === 1}
							Drop a file here to upload
						{:else}
							Drop files here to upload
						{/if}
					</span>
				</div>
			{/if}
		</div>
	</Portal>
{/if}
