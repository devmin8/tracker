<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Pagination } from '$lib/utils/pagination';

	type Props = Pagination & {
		onPageChange: (page: number) => void;
	};

	let { page, pageSize, pageCount, total, onPageChange }: Props = $props();

	const rangeStart = $derived(total === 0 ? 0 : (page - 1) * pageSize + 1);
	const rangeEnd = $derived(Math.min(page * pageSize, total));
</script>

<div class="flex items-center justify-between gap-3">
	<p class="text-muted-foreground text-sm tabular-nums">
		Showing {rangeStart}–{rangeEnd} of {total}
	</p>
	<div class="flex items-center gap-2">
		<Button variant="outline" size="sm" disabled={page <= 1} onclick={() => onPageChange(page - 1)}>
			Prev
		</Button>
		<span class="text-muted-foreground text-sm tabular-nums">
			Page {page} of {pageCount}
		</span>
		<Button
			variant="outline"
			size="sm"
			disabled={page >= pageCount}
			onclick={() => onPageChange(page + 1)}
		>
			Next
		</Button>
	</div>
</div>
