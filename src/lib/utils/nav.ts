import type { Pathname } from '$app/types';

export type Crumb = {
	label: string;
	href?: Pathname;
};

export type NavSubItem = {
	title: string;
	url: Pathname;
};

export type NavItem = {
	title: string;
	url: Pathname;
	items?: NavSubItem[];
};

export const navItems: NavItem[] = [
	{
		title: 'Dashboard',
		url: '/'
	},
	{
		title: 'Expenses',
		url: '/expenses'
	}
];

export function breadcrumbsFor(pathname: string): Crumb[] {
	for (const item of navItems) {
		if (item.items?.length) {
			const subItem = item.items.find((entry) => entry.url === pathname);
			if (subItem) {
				return [{ label: item.title, href: item.url }, { label: subItem.title }];
			}
		}

		if (item.url === pathname) {
			return [{ label: item.title }];
		}
	}

	return [{ label: 'Dashboard', href: '/' }];
}
