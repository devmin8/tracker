// CSV: date, description, amount, payment, running total
//   07/18/2026,CAFE EXAMPLE,12.50,,80.00
//   2026-03-23,COFFEE SHOP #1001,4.50,,
// Skip: empty amount (payments), and PTS / SSV transfers
//   06/25/2026,PAYMENT - THANK YOU,,40.00,5.00
//   PTS TO:  00000000000
//   SSV TO:  00000000000
// Dates: MM/dd/yyyy or yyyy-MM-dd, stored as canonical YYYY-MM-DD.
// Amounts stored as cents (12.50 -> 1250).
// Refined description:
//   COFFEE SHOP #1001 -> COFFEE SHOP
//   PRES/XXXX   _T -> PRES
//   SEND E-TFR ***abc -> SEND E-TFR

import Papa from 'papaparse';

import { toCents } from '$lib/utils/amount';
import { formatDateString } from '$lib/utils/date';

export type CleansedExpense = {
	expenseDate: string;
	amount: number;
	description: string;
	refinedDescription: string;
};

type ParseSuccess = { ok: true; expenses: CleansedExpense[] };
type ParseFailure = { ok: false };

const INTERNAL_TRANSFER = /^(PTS|SSV)\b/i;
const STRIP_MARKERS = ['#', '_', '***'] as const;

export function parseExpenseCsv(text: string): ParseSuccess | ParseFailure {
	const parsed = Papa.parse<string[]>(text.replace(/^\uFEFF/, ''), {
		skipEmptyLines: 'greedy'
	});

	if (parsed.errors.length > 0) return { ok: false };

	const expenses: CleansedExpense[] = [];

	for (const cols of parsed.data) {
		const expense = toExpense(cols);
		if (expense) expenses.push(expense);
	}

	return { ok: true, expenses };
}

// Personal bank exports are trusted; unsupported rows are intentionally skipped.
function toExpense(cols: string[]): CleansedExpense | null {
	const [rawDate = '', rawDescription = '', rawAmount = ''] = cols;
	const description = rawDescription.trim();
	const amount = toCents(rawAmount);
	const expenseDate = formatDateString(rawDate);

	if (amount === null) return null;
	if (!description || INTERNAL_TRANSFER.test(description)) return null;
	if (!expenseDate) return null;

	return {
		expenseDate,
		amount,
		description,
		refinedDescription: refineDescription(description)
	};
}

function refineDescription(description: string): string {
	if (description.toUpperCase().startsWith('PRES/')) return 'PRES';

	let refined = description;

	for (const marker of STRIP_MARKERS) {
		const index = refined.indexOf(marker);
		if (index !== -1) {
			refined = refined.slice(0, index);
		}
	}

	refined = refined.replace(/\s+/g, ' ').trim();
	return refined || description;
}
