import { describe, expect, test } from 'vitest';

import { pageOffset, paginate, parsePage } from './pagination';

describe('parsePage', () => {
	test('parses positive integers', () => {
		expect(parsePage('3')).toBe(3);
	});

	test('falls back to the first page for invalid values', () => {
		expect(parsePage(null)).toBe(1);
		expect(parsePage('0')).toBe(1);
		expect(parsePage('-2')).toBe(1);
		expect(parsePage('1.5')).toBe(1);
		expect(parsePage('abc')).toBe(1);
		expect(parsePage('1e100')).toBe(1);
		expect(parsePage('9007199254740992')).toBe(1);
	});
});

describe('paginate', () => {
	test('clamps the requested page and reports the page count', () => {
		expect(paginate(9, 120, 50)).toEqual({ page: 3, pageSize: 50, pageCount: 3, total: 120 });
		expect(paginate(0, 120, 50).page).toBe(1);
		expect(paginate(2, 120, 50).page).toBe(2);
	});

	test('always has at least one page', () => {
		expect(paginate(1, 0, 50)).toEqual({ page: 1, pageSize: 50, pageCount: 1, total: 0 });
		expect(paginate(1, 50, 50).pageCount).toBe(1);
		expect(paginate(1, 51, 50).pageCount).toBe(2);
	});
});

describe('pageOffset', () => {
	test('returns the number of rows before the page', () => {
		expect(pageOffset({ page: 1, pageSize: 50 })).toBe(0);
		expect(pageOffset({ page: 3, pageSize: 50 })).toBe(100);
	});
});
