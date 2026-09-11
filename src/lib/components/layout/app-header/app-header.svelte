<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { ToggleTheme } from '$lib/components/toggle-theme';
	import { breadcrumbsFor } from '$lib/components/layout/utils';

	const crumbs = $derived(breadcrumbsFor(page.url.pathname));
</script>

<header class="flex h-16 shrink-0 items-center gap-2 border-b">
	<div class="flex flex-1 items-center gap-2 px-3">
		<Sidebar.Trigger />
		<Separator orientation="vertical" class="me-2 h-4" />
		<Breadcrumb.Root>
			<Breadcrumb.List>
				{#each crumbs as crumb, index (crumb.label)}
					{#if index > 0}
						<Breadcrumb.Separator class="hidden md:block" />
					{/if}
					<Breadcrumb.Item class={index < crumbs.length - 1 ? 'hidden md:block' : undefined}>
						{#if crumb.href && index < crumbs.length - 1}
							<Breadcrumb.Link href={resolve(crumb.href)}>{crumb.label}</Breadcrumb.Link>
						{:else}
							<Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
						{/if}
					</Breadcrumb.Item>
				{/each}
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
	<div class="px-3">
		<ToggleTheme />
	</div>
</header>
