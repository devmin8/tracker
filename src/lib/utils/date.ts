export type YearMonthParts = {
	year: number;
	month: number;
};

declare const yearMonthBrand: unique symbol;

// Prevents an ordinary string is not assignable to YearMonth
// e.g.
//   const raw = '2026-09';
// yearMonthRange(raw); // TypeScript error
// yearMonthRange(resolveYearMonth(raw)); // okay
export type YearMonth = string & { readonly [yearMonthBrand]: true };

export type YearMonthInput = string | null | undefined;

export const MONTH_NAMES = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
] as const;

export const MONTH_NAMES_SHORT = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
] as const;

export const YEAR_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function parseYearMonth(value: YearMonthInput): YearMonthParts | undefined {
	if (!value) return undefined;

	const match = YEAR_MONTH_PATTERN.exec(value.trim());
	if (!match) return undefined;

	return { year: Number(match[1]), month: Number(match[2]) };
}

export function formatYearMonth({ year, month }: YearMonthParts): YearMonth {
	return `${year}-${String(month).padStart(2, '0')}` as YearMonth;
}

export function currentYearMonthParts(): YearMonthParts {
	const today = new Date();
	return { year: today.getFullYear(), month: today.getMonth() + 1 };
}

export function currentYearMonth(): YearMonth {
	return formatYearMonth(currentYearMonthParts());
}

export function resolveYearMonth(value: YearMonthInput): YearMonth {
	const parsed = parseYearMonth(value);
	return parsed ? formatYearMonth(parsed) : currentYearMonth();
}

export function compareYearMonths(a: YearMonthParts, b: YearMonthParts) {
	return a.year - b.year || a.month - b.month;
}

export function yearMonthRange(month: YearMonth) {
	const parsed = parseYearMonth(month);
	if (!parsed) throw new Error(`Invalid year-month: ${month}`);

	const next =
		parsed.month === 12
			? { year: parsed.year + 1, month: 1 }
			: { year: parsed.year, month: parsed.month + 1 };

	return {
		start: `${formatYearMonth(parsed)}-01`,
		end: `${formatYearMonth(next)}-01`
	};
}
