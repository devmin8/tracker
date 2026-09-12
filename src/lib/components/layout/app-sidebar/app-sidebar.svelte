<script lang="ts">
	import type { ComponentProps } from 'svelte';

	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Logo } from '$lib/components/logo';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { isNavGroup, navItems } from '$lib/components/layout/utils';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	const pathname = $derived(page.url.pathname);
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href={resolve('/')} {...props}>
							<Logo />
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-medium">Tracker</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each navItems as item (item.title)}
					<Sidebar.MenuItem>
						{#if isNavGroup(item)}
							<Sidebar.MenuButton
								class="font-medium hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent active:text-sidebar-foreground"
							>
								{#snippet child({ props })}
									<span {...props}>{item.title}</span>
								{/snippet}
							</Sidebar.MenuButton>

							<Sidebar.MenuSub>
								{#each item.items as subItem (subItem.title)}
									<Sidebar.MenuSubItem>
										<Sidebar.MenuSubButton isActive={pathname === subItem.url}>
											{#snippet child({ props })}
												<a href={resolve(subItem.url)} {...props}>{subItem.title}</a>
											{/snippet}
										</Sidebar.MenuSubButton>
									</Sidebar.MenuSubItem>
								{/each}
							</Sidebar.MenuSub>
						{:else}
							<Sidebar.MenuButton class="font-medium" isActive={pathname === item.url}>
								{#snippet child({ props })}
									<a href={resolve(item.url)} {...props}>{item.title}</a>
								{/snippet}
							</Sidebar.MenuButton>
						{/if}
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
