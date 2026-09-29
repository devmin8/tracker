<script lang="ts">
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { toast } from 'svelte-sonner';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { safeResolve } from '$lib/utils/safe-resolve';

	export type SidebarUser = {
		name: string;
		email: string;
	};

	type Props = {
		user: SidebarUser;
	};

	let { user }: Props = $props();

	const sidebar = Sidebar.useSidebar();
	const initials = $derived(userInitials(user.name));

	function userInitials(name: string): string {
		const parts = name.trim().split(/\s+/).filter(Boolean);
		if (parts.length >= 2) {
			return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
		}

		return name.slice(0, 2).toUpperCase() || '?';
	}

	async function logout() {
		const result = await safeResolve(() => authClient.signOut());
		const error = result.ok ? result.result.error : result.error;

		if (error) {
			toast.error('Unable to sign out. Try again.');
			return;
		}

		await goto(resolve('/login'), { invalidateAll: true });
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<Avatar.Root class="size-8 rounded-lg after:rounded-lg">
							<Avatar.Fallback class="rounded-lg">{initials}</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">{user.name}</span>
							<span class="truncate text-xs">{user.email}</span>
						</div>
						<ChevronsUpDownIcon class="ms-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Item onSelect={logout}>
					<LogOutIcon />
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
