import { describe, expect, it } from 'vitest';

import { clampTasksPage, parseTaskFilter, parseTasksPage } from './task-list';
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

describe('tasks pagination', () => {
	it('defaults to the first page for missing or invalid values', () => {
		expect(parseTasksPage(null)).toBe(1);
		expect(parseTasksPage('nope')).toBe(1);
		expect(parseTasksPage('0')).toBe(1);
		expect(parseTasksPage('2')).toBe(2);
	});

	it('clamps the page into the available range', () => {
		expect(clampTasksPage(1, 0, 50)).toBe(1);
		expect(clampTasksPage(5, 120, 50)).toBe(3);
		expect(clampTasksPage(2, 120, 50)).toBe(2);
	});
});
