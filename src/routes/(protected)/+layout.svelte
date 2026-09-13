<script lang="ts">
	import { AppHeader, AppSidebar } from '$lib/components/layout';
	import * as Sidebar from '$lib/components/ui/sidebar';

	let { children } = $props();
</script>

<Sidebar.Provider class="h-svh">
	<AppSidebar />
	<Sidebar.Inset class="min-h-0 overflow-hidden">
		<AppHeader />
		<div class="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
