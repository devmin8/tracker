import { describe, expect, test } from 'vitest';

import { formatCents, toCents } from './amount';

describe('formatCents', () => {
	test('formats cents as a signed dollar amount', () => {
		expect(formatCents(1250)).toBe('$12.50');
		expect(formatCents(0)).toBe('$0.00');
		expect(formatCents(-450)).toBe('-$4.50');
	});
});

describe('toCents', () => {
	test('parses dollar amounts into cents', () => {
		expect(toCents('12.50')).toBe(1250);
		expect(toCents('12')).toBe(1200);
		expect(toCents('12.5')).toBe(1250);
		expect(toCents('  $1,234.56  ')).toBe(123456);
		expect(toCents('-4.50')).toBe(-450);
	});

	test('rejects empty, non-numeric, and over-precise values', () => {
		expect(toCents('')).toBeNull();
		expect(toCents('twelve')).toBeNull();
		expect(toCents('12.505')).toBeNull();
	});
});
