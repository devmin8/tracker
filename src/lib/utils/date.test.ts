import { describe, expect, test } from 'vitest';

import { calendarMonthRange, currentCalendarMonth } from './date';

describe('currentCalendarMonth', () => {
	test('formats the current year and month as YYYY-MM', () => {
		expect(currentCalendarMonth(new Date(2026, 8, 10))).toBe('2026-09');
	});

	test('zero-pads single-digit months', () => {
		expect(currentCalendarMonth(new Date(2026, 0, 5))).toBe('2026-01');
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
