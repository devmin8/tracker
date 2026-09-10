<script lang="ts">
	import FileSpreadsheetIcon from '@lucide/svelte/icons/file-spreadsheet';
	import XIcon from '@lucide/svelte/icons/x';
	import { toast } from 'svelte-sonner';

	import { Button } from '$lib/components/ui/button';
	import * as FileDropZone from '$lib/components/ui/file-drop-zone';
	import { Progress } from '$lib/components/ui/progress';

	type UploadStatus = 'pending' | 'uploading' | 'error';

	type UploadedFile = {
		id: string;
		file: File;
		progress: number;
		status: UploadStatus;
	};

	let files = $state<UploadedFile[]>([]);

	const isUploading = $derived(files.some((file) => file.status === 'uploading'));

	const canUpload = $derived(
		!isUploading && files.some((file) => file.status === 'pending' || file.status === 'error')
	);

	const onUpload: FileDropZone.FileDropZoneRootProps['onUpload'] = async (selectedFiles) => {
		const newFiles = selectedFiles.filter(
			(file) => !files.some((uploadedFile) => uploadedFile.file.name === file.name)
		);

		files.push(
			...newFiles.map((file) => ({
				id: crypto.randomUUID(),
				file,
				progress: 0,
				status: 'pending' as const
			}))
		);
	};

	const onFileRejected: FileDropZone.FileDropZoneRootProps['onFileRejected'] = ({
		reason,
		file
	}) => {
		toast.error(`${file.name} was not added`, { description: reason });
	};

	async function uploadFiles() {
		const filesToUpload = files.filter(
			(file) => file.status === 'pending' || file.status === 'error'
		);

		await Promise.all(filesToUpload.map(uploadFile));
	}

	async function uploadFile(uploadedFile: UploadedFile) {
		const { file } = uploadedFile;
		uploadedFile.progress = 0;
		uploadedFile.status = 'uploading';

		try {
			const result = await sendFile(file, (progress) => {
				uploadedFile.progress = progress;
			});

			uploadedFile.progress = 100;
			toast.success(`${result.rowCount} data rows uploaded`, { description: file.name });
			removeFile(uploadedFile.id);
		} catch (error) {
			uploadedFile.status = 'error';
			uploadedFile.progress = 0;
			toast.error(`${file.name} failed to upload`, {
				description: error instanceof Error ? error.message : 'Upload failed'
			});
		}
	}

	function sendFile(
		file: File,
		onProgress: (progress: number) => void
	): Promise<{ rowCount: number }> {
		return new Promise((resolve, reject) => {
			const request = new XMLHttpRequest();
			const formData = new FormData();
			formData.append('file', file);

			request.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
			});

			request.addEventListener('load', () => {
				const response = parseResponse(request);

				if (request.status >= 200 && request.status < 300) {
					resolve(response as { rowCount: number });
					return;
				}

				reject(new Error(response?.message ?? 'Upload failed'));
			});

			request.addEventListener('error', () => reject(new Error('Network error while uploading')));
			request.open('POST', '/expenses/upload');
			request.send(formData);
		});
	}

	function parseResponse(request: XMLHttpRequest): { rowCount: number; message?: string } | null {
		try {
			return JSON.parse(request.responseText);
		} catch {
			return null;
		}
	}

	function removeFile(id: string) {
		files = files.filter((file) => file.id !== id);
	}
</script>

<div class="flex flex-col gap-4">
	<FileDropZone.Root
		{onUpload}
		{onFileRejected}
		maxFileSize={1 * FileDropZone.MEGABYTE}
		accept=".csv,text/csv"
		maxFiles={4}
		fileCount={files.length}
	>
		<FileDropZone.Trigger />
	</FileDropZone.Root>

	{#if files.length > 0}
		<Button class="self-end" disabled={!canUpload} onclick={uploadFiles}>Upload</Button>

		<div class="flex flex-col gap-2">
			{#each files as uploadedFile (uploadedFile.id)}
				<div class="flex items-center gap-3 rounded-lg border p-3">
					<div class="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
						<FileSpreadsheetIcon class="text-muted-foreground size-4" />
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center justify-between gap-3">
							<div class="min-w-0">
								<p class="truncate text-sm font-medium">{uploadedFile.file.name}</p>
								<p class="text-muted-foreground text-xs">
									{FileDropZone.displaySize(uploadedFile.file.size)}
								</p>
							</div>
							{#if uploadedFile.status !== 'uploading'}
								<Button
									variant="ghost"
									size="icon-sm"
									aria-label={`Remove ${uploadedFile.file.name}`}
									onclick={() => removeFile(uploadedFile.id)}
								>
									<XIcon />
								</Button>
							{/if}
						</div>
						{#if uploadedFile.status === 'uploading'}
							<div class="mt-2 flex items-center gap-2">
								<Progress class="h-1.5" value={uploadedFile.progress} />
								<span class="text-muted-foreground w-9 text-right text-xs">
									{uploadedFile.progress}%
								</span>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
