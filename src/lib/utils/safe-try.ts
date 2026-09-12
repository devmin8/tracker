export type SafeTryOk<T> = {
	ok: true;
	result: T;
};

export type SafeTryErr = {
	ok: false;
	result: undefined;
	error: unknown;
};

export type SafeTryResult<T> = SafeTryOk<T> | SafeTryErr;

const unset = Symbol();

export function safeTry<T>(fn: () => T, defaultValue: T): T;
export function safeTry<T>(fn: () => T): SafeTryResult<T>;
export function safeTry<T>(fn: () => T, defaultValue: T | typeof unset = unset) {
	try {
		const result = fn();
		// Default means "return T"; unset means wrap as { ok, result }.
		if (defaultValue !== unset) return result;
		return { ok: true, result } satisfies SafeTryOk<T>;
	} catch (error) {
		if (defaultValue !== unset) return defaultValue;
		return { ok: false, result: undefined, error } satisfies SafeTryErr;
	}
}
