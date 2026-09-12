import { describe, expect, test } from 'vitest';

import { safeTry } from './safe-try';

describe('safeTry', () => {
	test('returns the value when a default is given', () => {
		expect(safeTry(() => 1, 0)).toBe(1);
	});

	test('returns the default when the function throws', () => {
		expect(
			safeTry(() => {
				throw new Error('nope');
			}, '127.0.0.1')
		).toBe('127.0.0.1');
	});

	test('returns ok when no default is given', () => {
		expect(safeTry(() => 1)).toEqual({ ok: true, result: 1 });
	});

	test('returns the error as a value when no default is given', () => {
		const error = new Error('nope');
		const outcome = safeTry(() => {
			throw error;
		});

		expect(outcome.ok).toBe(false);
		if (!outcome.ok) {
			expect(outcome.result).toBeUndefined();
			expect(outcome.error).toBe(error);
		}
	});
});
