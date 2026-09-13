import * as v from 'valibot';

import { formatYearMonth, parseYearMonth } from '$lib/utils/date';

const MAX_FILE_SIZE = 1 * 1024 * 1024;

export const ImportExpensesFormSchema = v.object({
	file: v.pipe(
		v.instance(File, 'A CSV file is required'),
		v.check((file) => file.name.toLowerCase().endsWith('.csv'), 'Only CSV files are supported'),
		v.check((file) => file.size <= MAX_FILE_SIZE, 'Files must be 1 MB or smaller')
	),
	month: v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty('A month is required'),
		v.check((month) => parseYearMonth(month) !== null, 'Month must be YYYY-MM'),
		v.transform((month) => formatYearMonth(parseYearMonth(month)!))
	)
});
