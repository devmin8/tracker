<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/utils/cn';

	type Props = WithElementRef<HTMLAttributes<HTMLTableSectionElement>> & {
		sticky?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		sticky = false,
		children,
		...restProps
	}: Props = $props();

	// Keeps each header cell visible above scrolling table rows.
	const stickyHeaderClass = '[&>tr>th]:sticky [&>tr>th]:top-0 [&>tr>th]:z-20 [&>tr>th]:bg-card';
</script>

<thead
	bind:this={ref}
	data-slot="table-header"
	class={cn('[&_tr]:border-b', sticky && stickyHeaderClass, className)}
	{...restProps}
>
	{@render children?.()}
</thead>
