<script lang="ts">
	import { cn } from '$lib/utils/cn';

	let { class: className }: { class?: string } = $props();
</script>

<div
	class={cn(
		'flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-white',
		className
	)}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		class="size-[19px]"
		aria-hidden="true"
	>
		<path fill="currentColor" d="M4.5 4.5h15v4.25h-5.38V19.5H9.88V8.75H4.5V4.5Z" />
	</svg>
</div>
