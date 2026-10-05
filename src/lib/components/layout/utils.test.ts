import { describe, expect, it } from 'vitest';

import { breadcrumbsFor, navItems } from './utils';

describe('navigation', () => {
	it('models grouped items without a URL', () => {
		const expenses = navItems.find((item) => item.title === 'Expenses');

		expect(expenses).toEqual({
			title: 'Expenses',
			items: [
				{ title: 'View expenses', url: '/expenses/list' },
				{ title: 'Upload Transactions', url: '/transactions/upload' }
			]
		});
	});

	it('does not link a grouped item in breadcrumbs', () => {
		expect(breadcrumbsFor('/expenses/list')).toEqual([
			{ label: 'Expenses' },
			{ label: 'View expenses' }
		]);
		expect(breadcrumbsFor('/transactions/upload')).toEqual([
			{ label: 'Expenses' },
			{ label: 'Upload Transactions' }
		]);
		expect(breadcrumbsFor('/reports/yearly')).toEqual([{ label: 'Reports' }, { label: 'Yearly' }]);
	});
});
