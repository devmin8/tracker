import { describe, expect, it } from 'vitest';

import { parseTaskFilter } from './task-list';
import { displayTaskStatus } from './task-status';

describe('parseTaskFilter', () => {
	it('defaults to all for missing or unknown values', () => {
		expect(parseTaskFilter(null)).toBe('all');
		expect(parseTaskFilter(undefined)).toBe('all');
		expect(parseTaskFilter('')).toBe('all');
		expect(parseTaskFilter('archived')).toBe('all');
	});

	it('parses every supported filter', () => {
		expect(parseTaskFilter('all')).toBe('all');
		expect(parseTaskFilter('open')).toBe('open');
		expect(parseTaskFilter('done')).toBe('done');
		expect(parseTaskFilter('not-done')).toBe('not-done');
		expect(parseTaskFilter(' Done ')).toBe('done');
	});
});

describe('displayTaskStatus', () => {
	it('marks overdue open tasks as past due', () => {
		expect(displayTaskStatus('2026-09-01', 'open', '2026-09-29')).toBe('Past due');
		expect(displayTaskStatus('2026-09-01', 'not-done', '2026-09-29')).toBe('Past due');
	});

	it('never marks done tasks as past due', () => {
		expect(displayTaskStatus('2026-09-01', 'done', '2026-09-29')).toBe('Done');
	});

	it('shows the stored status when the task is not overdue', () => {
		expect(displayTaskStatus('2026-09-29', 'open', '2026-09-29')).toBe('Open');
		expect(displayTaskStatus('2026-10-01', 'not-done', '2026-09-29')).toBe('Not Done');
	});
});
