import type { Pathname } from '$app/types';

export type Crumb = {
	label: string;
	href?: Pathname;
};

export type NavSubItem = {
	title: string;
	url: Pathname;
};

type NavLeafItem = {
	title: string;
	url: Pathname;
	items?: never;
};

type NavGroupItem = {
	title: string;
	items: readonly [NavSubItem, ...NavSubItem[]];
	url?: never;
};

export type NavItem = NavLeafItem | NavGroupItem;

export function isNavGroup(item: NavItem): item is NavGroupItem {
	return item.items !== undefined;
}

export const navItems: NavItem[] = [
	{
		title: 'Dashboard',
		url: '/'
	},
	{
		title: 'Expenses',
		items: [
			{ title: 'View expenses', url: '/expenses/list' },
			{ title: 'Upload Expenses', url: '/expenses/upload' }
		]
	}
];

export function breadcrumbsFor(pathname: string): Crumb[] {
	for (const item of navItems) {
		if (isNavGroup(item)) {
			const subItem = item.items.find((entry) => entry.url === pathname);
			if (subItem) {
				return [{ label: item.title }, { label: subItem.title }];
			}

			continue;
		}

		if (item.url === pathname) {
			return [{ label: item.title }];
		}
	}

	return [{ label: 'Dashboard', href: '/' }];
}
