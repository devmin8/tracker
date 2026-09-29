import { describe, expect, it } from 'vitest';

import { resolveDefaultAssignee, toAssigneeOptions } from './assignee';

describe('toAssigneeOptions', () => {
	it('maps assignees to select options', () => {
		expect(
			toAssigneeOptions([
				{ id: 'user-1', name: 'Asha', email: 'asha@test.com' },
				{ id: 'user-2', name: 'Ravi', email: 'ravi@test.com' }
			])
		).toEqual([
			{ value: 'user-1', label: 'Asha' },
			{ value: 'user-2', label: 'Ravi' }
		]);
	});
});

describe('resolveDefaultAssignee', () => {
	it('prefers the given id when it exists', () => {
		expect(
			resolveDefaultAssignee([{ id: 'user-1', name: 'Asha', email: 'asha@test.com' }], 'user-1')
		).toBe('user-1');
	});

	it('falls back to the first assignee for unknown ids', () => {
		expect(
			resolveDefaultAssignee(
				[
					{ id: 'user-1', name: 'Asha', email: 'asha@test.com' },
					{ id: 'user-2', name: 'Ravi', email: 'ravi@test.com' }
				],
				'missing'
			)
		).toBe('user-1');
	});

	it('returns an empty string when nobody can be assigned', () => {
		expect(resolveDefaultAssignee([], 'user-1')).toBe('');
	});
});
