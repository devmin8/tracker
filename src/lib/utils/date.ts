import { addMonths, format, parse } from 'date-fns';

export type CalendarMonthRange = {
	start: string;
	end: string;
};

export function currentCalendarMonth(now = new Date()) {
	return format(now, 'yyyy-MM');
}

export function calendarMonthRange(month: string): CalendarMonthRange {
	const startDate = parse(`${month}-01`, 'yyyy-MM-dd', new Date());

	return {
		start: format(startDate, 'yyyy-MM-dd'),
		end: format(addMonths(startDate, 1), 'yyyy-MM-dd')
	};
}
