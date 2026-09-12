import { afterEach, describe, expect, test, vi } from 'vitest';

import {
	compareYearMonths,
	currentYearMonth,
	formatYearMonth,
	parseYearMonth,
	resolveYearMonth,
	yearMonthRange
} from './date';

afterEach(() => {
	vi.useRealTimers();
});

describe('parseYearMonth', () => {
	test('parses a zero-padded calendar month', () => {
		expect(parseYearMonth('2026-09')).toEqual({ year: 2026, month: 9 });
	});

	test('rejects missing, unpadded, and out-of-range values', () => {
		expect(parseYearMonth(null)).toBeUndefined();
		expect(parseYearMonth(undefined)).toBeUndefined();
		expect(parseYearMonth('')).toBeUndefined();
		expect(parseYearMonth('2026-9')).toBeUndefined();
		expect(parseYearMonth('2026-13')).toBeUndefined();
		expect(parseYearMonth('2026-00')).toBeUndefined();
	});
});

describe('formatYearMonth', () => {
	test('formats year and month as YYYY-MM', () => {
		expect(formatYearMonth({ year: 2026, month: 9 })).toBe('2026-09');
		expect(formatYearMonth({ year: 2026, month: 1 })).toBe('2026-01');
	});
});

describe('currentYearMonth', () => {
	test('formats the current year and month as YYYY-MM', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 8, 10));

		expect(currentYearMonth()).toBe('2026-09');
	});

	test('zero-pads single-digit months', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 0, 5));

		expect(currentYearMonth()).toBe('2026-01');
	});
});

describe('resolveYearMonth', () => {
	test('keeps a valid calendar month', () => {
		expect(resolveYearMonth('2026-07')).toBe('2026-07');
	});

	test('falls back to the current month when the value is missing or invalid', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 8, 11));

		expect(resolveYearMonth(undefined)).toBe('2026-09');
		expect(resolveYearMonth('2026-13')).toBe('2026-09');
	});
});

describe('compareYearMonths', () => {
	test('orders by year then month', () => {
		expect(compareYearMonths({ year: 2025, month: 12 }, { year: 2026, month: 1 })).toBeLessThan(0);
		expect(compareYearMonths({ year: 2026, month: 9 }, { year: 2026, month: 9 })).toBe(0);
		expect(compareYearMonths({ year: 2026, month: 10 }, { year: 2026, month: 9 })).toBeGreaterThan(
			0
		);
	});
});

describe('yearMonthRange', () => {
	test('uses a half-open text range for a selected month', () => {
		expect(yearMonthRange(formatYearMonth({ year: 2026, month: 9 }))).toEqual({
			start: '2026-09-01',
			end: '2026-10-01'
		});
	});

	test('rolls December into the next year', () => {
		expect(yearMonthRange(formatYearMonth({ year: 2026, month: 12 }))).toEqual({
			start: '2026-12-01',
			end: '2027-01-01'
		});
	});
});
