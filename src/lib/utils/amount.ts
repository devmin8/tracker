const DOLLARS = /^-?\d+(\.\d{1,2})?$/;

function absDollars(cents: number) {
	return (Math.abs(cents) / 100).toFixed(2);
}

export function formatCents(cents: number) {
	return `${cents < 0 ? '-' : ''}$${absDollars(cents)}`;
}

export function centsToInput(cents: number) {
	return `${cents < 0 ? '-' : ''}${absDollars(cents)}`;
}

export function toCents(value: string) {
	const dollars = value.trim().replace(/[$,]/g, '');
	if (!DOLLARS.test(dollars)) {
		return null;
	}
	return Math.round(Number(dollars) * 100);
}
