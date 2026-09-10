<script lang="ts">
	import { box } from 'svelte-toolbelt';

	import { useFileDropZone } from './file-drop-zone.svelte.ts';
	import type { FileDropZoneRootProps } from './types';

	const uid = $props.id();
	let {
		id = uid,
		maxFiles,
		maxFileSize,
		fileCount,
		disabled = false,
		onUpload,
		onFileRejected,
		accept,
		capturePaste = false,
		children,
		...rest
	}: FileDropZoneRootProps = $props();

	const rootState = useFileDropZone({
		id: box.with(() => id),
		disabled: box.with(() => disabled ?? false),
		onUpload: box.with(() => onUpload),
		maxFiles: box.with(() => maxFiles),
		fileCount: box.with(() => fileCount),
		maxFileSize: box.with(() => maxFileSize),
		onFileRejected: box.with(() => onFileRejected),
		accept: box.with(() => accept)
	});
</script>

<svelte:document onpaste={capturePaste ? rootState.onpaste : undefined} />

<input class="hidden" {...rootState.props} {...rest} />

{@render children?.()}
