// Tag review CSV, see .docs/update-tag.md for the format.

import Papa from 'papaparse';

import type { UntaggedDescription, UntaggedVisit } from '$lib/server/tags';
import { centsToInput } from '$lib/utils/amount';

const COLUMNS = [
	'refined_description',
	'visits',
	'suggested_tag',
	'note',
	'result',
	'error'
] as const;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const VISIT_SEPARATOR = '; ';
const NEW_TAG_PREFIX = 'new:';
const APPLIED_RESULT = 'ok';
const FAILED_RESULT = 'error';

type Column = (typeof COLUMNS)[number];

export type TagReviewRow = {
	refinedDescription: string;
	visits: string;
	suggestedTag: string;
	note: string;
	result: string;
	error: string;
};

export type TagEdit = {
	refinedDescription: string;
	suggestedTag: string;
};

export type TagReviewContext = {
	tagsByKey: Map<string, string>;
	untagged: Set<string>;
};

export type TagReviewDecision =
	{ kind: 'ignore' } | { kind: 'apply'; tagName: string } | { kind: 'error'; message: string };

type ParseReviewResult = { ok: true; rows: TagReviewRow[] } | { ok: false; message: string };

export function createReviewCsv(descriptions: UntaggedDescription[]): string {
	return serializeReviewCsv(
		descriptions.map(({ refinedDescription, visits }) => ({
			refinedDescription,
			visits: visits.map(formatVisit).join(VISIT_SEPARATOR),
			suggestedTag: '',
			note: '',
			result: '',
			error: ''
		}))
	);
}

export function parseReviewCsv(text: string): ParseReviewResult {
	const parsed = Papa.parse<Record<Column, string | undefined>>(text.replace(/^\uFEFF/, ''), {
		header: true,
		skipEmptyLines: 'greedy'
	});

	if (parsed.errors.length > 0) {
		return { ok: false, message: 'The CSV could not be parsed' };
	}

	const missing = COLUMNS.filter((column) => !parsed.meta.fields?.includes(column));
	if (missing.length > 0) {
		return { ok: false, message: `Missing columns: ${missing.join(', ')}` };
	}

	const rows = parsed.data.map((cells) => ({
		refinedDescription: cells.refined_description ?? '',
		visits: cells.visits ?? '',
		suggestedTag: (cells.suggested_tag ?? '').trim(),
		note: cells.note ?? '',
		result: (cells.result ?? '').trim(),
		error: cells.error ?? ''
	}));

	return { ok: true, rows };
}

export function serializeReviewCsv(rows: TagReviewRow[]): string {
	const data = rows.map((row) => [
		row.refinedDescription,
		row.visits,
		row.suggestedTag,
		row.note,
		row.result,
		row.error
	]);

	return `${Papa.unparse({ fields: [...COLUMNS], data }, { newline: '\n' })}\n`;
}

export function tagNameKey(name: string) {
	return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isApplied(row: TagReviewRow) {
	return row.result.toLowerCase() === APPLIED_RESULT;
}

export function resolveReviewRow(row: TagReviewRow, context: TagReviewContext): TagReviewDecision {
	if (isApplied(row) || row.suggestedTag === '') return { kind: 'ignore' };

	if (!context.untagged.has(row.refinedDescription)) {
		return { kind: 'error', message: 'already tagged' };
	}

	const isNew = row.suggestedTag.toLowerCase().startsWith(NEW_TAG_PREFIX);
	const name = (isNew ? row.suggestedTag.slice(NEW_TAG_PREFIX.length) : row.suggestedTag)
		.trim()
		.replace(/\s+/g, ' ');
	if (!name) return { kind: 'error', message: 'Tag name is required' };

	const existing = context.tagsByKey.get(tagNameKey(name));
	if (existing) return { kind: 'apply', tagName: existing };
	if (isNew) return { kind: 'apply', tagName: name };

	return { kind: 'error', message: `tag not found: ${name}` };
}

// Applied rows are locked; edits for them are ignored.
export function applyTagEdits(rows: TagReviewRow[], edits: TagEdit[]) {
	const editsByDescription = new Map(
		edits.map((edit) => [edit.refinedDescription, edit.suggestedTag.trim()])
	);

	for (const row of rows) {
		const suggestedTag = editsByDescription.get(row.refinedDescription);
		if (suggestedTag === undefined || isApplied(row)) continue;
		row.suggestedTag = suggestedTag;
	}
}

export function markApplied(row: TagReviewRow) {
	row.result = APPLIED_RESULT;
	row.error = '';
}

export function markFailed(row: TagReviewRow, message: string) {
	row.result = FAILED_RESULT;
	row.error = message;
}

// == local functions ==

function formatVisit({ expenseDate, amount }: UntaggedVisit) {
	const weekday = WEEKDAYS[new Date(`${expenseDate}T00:00:00Z`).getUTCDay()];
	return `${expenseDate} ${weekday} ${centsToInput(amount)}`;
}
