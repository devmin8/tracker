export type CalendarMonthParts = {
	year: number;
	month: number;
};

export type CalendarMonthRange = {
	start: string;
	end: string;
};

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

export const CALENDAR_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function parseCalendarMonth(value: string | undefined): CalendarMonthParts | undefined {
	if (!value) return undefined;

	const match = CALENDAR_MONTH_PATTERN.exec(value.trim());
	if (!match) return undefined;

	return { year: Number(match[1]), month: Number(match[2]) };
}

export function formatCalendarMonth({ year, month }: CalendarMonthParts) {
	return `${year}-${String(month).padStart(2, '0')}`;
}

export function currentCalendarMonthParts(now = new Date()): CalendarMonthParts {
	return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function currentCalendarMonth(now = new Date()) {
	return formatCalendarMonth(currentCalendarMonthParts(now));
}

export function resolveCalendarMonth(value: string | undefined, now = new Date()) {
	const parsed = parseCalendarMonth(value);
	return parsed ? formatCalendarMonth(parsed) : currentCalendarMonth(now);
}

export function compareCalendarMonths(a: CalendarMonthParts, b: CalendarMonthParts) {
	return a.year - b.year || a.month - b.month;
}

export function calendarMonthRange(month: string): CalendarMonthRange {
	const parsed = parseCalendarMonth(month);
	if (!parsed) {
		throw new Error(`Invalid calendar month: ${month}`);
	}

	const next =
		parsed.month === 12
			? { year: parsed.year + 1, month: 1 }
			: { year: parsed.year, month: parsed.month + 1 };

	return {
		start: `${formatCalendarMonth(parsed)}-01`,
		end: `${formatCalendarMonth(next)}-01`
	};
}
