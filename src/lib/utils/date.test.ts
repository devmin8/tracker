import { describe, expect, test } from 'vitest';

import {
	calendarMonthRange,
	compareCalendarMonths,
	currentCalendarMonth,
	formatCalendarMonth,
	parseCalendarMonth,
	resolveCalendarMonth
} from './date';

describe('parseCalendarMonth', () => {
	test('parses a zero-padded calendar month', () => {
		expect(parseCalendarMonth('2026-09')).toEqual({ year: 2026, month: 9 });
	});

	test('rejects missing, unpadded, and out-of-range values', () => {
		expect(parseCalendarMonth(undefined)).toBeUndefined();
		expect(parseCalendarMonth('')).toBeUndefined();
		expect(parseCalendarMonth('2026-9')).toBeUndefined();
		expect(parseCalendarMonth('2026-13')).toBeUndefined();
		expect(parseCalendarMonth('2026-00')).toBeUndefined();
	});
});

describe('formatCalendarMonth', () => {
	test('formats year and month as YYYY-MM', () => {
		expect(formatCalendarMonth({ year: 2026, month: 9 })).toBe('2026-09');
		expect(formatCalendarMonth({ year: 2026, month: 1 })).toBe('2026-01');
	});
});

describe('currentCalendarMonth', () => {
	test('formats the current year and month as YYYY-MM', () => {
		expect(currentCalendarMonth(new Date(2026, 8, 10))).toBe('2026-09');
	});

	test('zero-pads single-digit months', () => {
		expect(currentCalendarMonth(new Date(2026, 0, 5))).toBe('2026-01');
	});
});

describe('resolveCalendarMonth', () => {
	test('keeps a valid calendar month', () => {
		expect(resolveCalendarMonth('2026-07')).toBe('2026-07');
	});

	test('falls back to the current month when the value is missing or invalid', () => {
		const now = new Date(2026, 8, 11);
		expect(resolveCalendarMonth(undefined, now)).toBe('2026-09');
		expect(resolveCalendarMonth('2026-13', now)).toBe('2026-09');
	});
});

describe('compareCalendarMonths', () => {
	test('orders by year then month', () => {
		expect(compareCalendarMonths({ year: 2025, month: 12 }, { year: 2026, month: 1 })).toBeLessThan(
			0
		);
		expect(compareCalendarMonths({ year: 2026, month: 9 }, { year: 2026, month: 9 })).toBe(0);
		expect(
			compareCalendarMonths({ year: 2026, month: 10 }, { year: 2026, month: 9 })
		).toBeGreaterThan(0);
	});
});

describe('calendarMonthRange', () => {
	test('uses a half-open text range for a selected month', () => {
		expect(calendarMonthRange('2026-09')).toEqual({
			start: '2026-09-01',
			end: '2026-10-01'
		});
	});

	test('rolls December into the next year', () => {
		expect(calendarMonthRange('2026-12')).toEqual({
			start: '2026-12-01',
			end: '2027-01-01'
		});
	});
});
