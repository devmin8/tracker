import { describe, expect, test } from 'vitest';

import { safeResolve } from './safe-resolve';

describe('safeResolve', () => {
	test('returns ok when the promise resolves', async () => {
		await expect(safeResolve(() => Promise.resolve(1))).resolves.toEqual({ ok: true, result: 1 });
	});

	test('returns the error as a value when the promise rejects', async () => {
		const error = new Error('nope');
		const outcome = await safeResolve(() => Promise.reject(error));

		expect(outcome.ok).toBe(false);
		if (!outcome.ok) {
			expect(outcome.result).toBeUndefined();
			expect(outcome.error).toBe(error);
		}
	});
});
