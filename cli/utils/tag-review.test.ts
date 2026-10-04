import { describe, expect, test } from 'vitest';

import {
	applyTagEdits,
	createReviewCsv,
	parseReviewCsv,
	resolveReviewRow,
	serializeReviewCsv,
	type TagReviewContext,
	type TagReviewRow
} from './tag-review';

const HEADER = 'refined_description,visits,suggested_tag,note,result,error';

function row(overrides: Partial<TagReviewRow> = {}): TagReviewRow {
	return {
		refinedDescription: 'LUNCH PLACE',
		visits: '2026-09-14 Mon 18.07',
		suggestedTag: '',
		note: '',
		result: '',
		error: '',
		...overrides
	};
}

function context(tags: string[] = ['Lunch']): TagReviewContext {
	return {
		tagsByKey: new Map(tags.map((name) => [name.toLowerCase(), name])),
		untagged: new Set(['LUNCH PLACE'])
	};
}

describe('createReviewCsv', () => {
	test('writes one row per description with dated visits', () => {
		const csv = createReviewCsv([
			{
				refinedDescription: 'COFFEE SHOP',
				visits: [
					{ expenseDate: '2026-09-14', amount: 450 },
					{ expenseDate: '2026-09-19', amount: 1807 }
				]
			},
			{ refinedDescription: 'SQ *SHOP, LLC', visits: [{ expenseDate: '2026-09-18', amount: 1200 }] }
		]);

		expect(csv).toBe(
			[
				HEADER,
				'COFFEE SHOP,2026-09-14 Mon 4.50; 2026-09-19 Sat 18.07,,,,',
				'"SQ *SHOP, LLC",2026-09-18 Fri 12.00,,,,',
				''
			].join('\n')
		);
	});
});

describe('parseReviewCsv', () => {
	test('round-trips rows through serialize', () => {
		const rows = [row({ suggestedTag: 'new:Lunch', note: 'grill, chain' })];
		expect(parseReviewCsv(serializeReviewCsv(rows))).toEqual({ ok: true, rows });
	});

	test('rejects a file with missing columns', () => {
		expect(parseReviewCsv('refined_description,suggested_tag\nA,B\n')).toEqual({
			ok: false,
			message: 'Missing columns: visits, note, result, error'
		});
	});
});

describe('resolveReviewRow', () => {
	test('ignores blank and already applied rows', () => {
		expect(resolveReviewRow(row(), context())).toEqual({ kind: 'ignore' });
		expect(resolveReviewRow(row({ suggestedTag: 'Lunch', result: 'ok' }), context())).toEqual({
			kind: 'ignore'
		});
	});

	test('links an existing tag case-insensitively', () => {
		expect(resolveReviewRow(row({ suggestedTag: 'lunch' }), context())).toEqual({
			kind: 'apply',
			tagName: 'Lunch'
		});
	});

	test('creates a tag only with the new: prefix', () => {
		expect(resolveReviewRow(row({ suggestedTag: 'new:Groceries' }), context())).toEqual({
			kind: 'apply',
			tagName: 'Groceries'
		});
		expect(resolveReviewRow(row({ suggestedTag: 'Groceries' }), context())).toEqual({
			kind: 'error',
			message: 'tag not found: Groceries'
		});
	});

	test('links new: to the existing tag when the name already exists', () => {
		expect(resolveReviewRow(row({ suggestedTag: 'new:lunch' }), context())).toEqual({
			kind: 'apply',
			tagName: 'Lunch'
		});
	});

	test('retries failed rows', () => {
		expect(
			resolveReviewRow(row({ suggestedTag: 'Lunch', result: 'error', error: 'x' }), context())
		).toEqual({ kind: 'apply', tagName: 'Lunch' });
	});

	test('reports empty new: names and stale rows', () => {
		expect(resolveReviewRow(row({ suggestedTag: 'new:' }), context())).toEqual({
			kind: 'error',
			message: 'Tag name is required'
		});
		expect(
			resolveReviewRow(row({ refinedDescription: 'COFFEE SHOP', suggestedTag: 'Lunch' }), context())
		).toEqual({ kind: 'error', message: 'already tagged' });
	});
});

describe('applyTagEdits', () => {
	test('updates matching rows and leaves applied rows locked', () => {
		const rows = [
			row(),
			row({ refinedDescription: 'COFFEE SHOP', suggestedTag: 'Lunch', result: 'ok' })
		];

		applyTagEdits(rows, [
			{ refinedDescription: 'LUNCH PLACE', suggestedTag: ' new:Lunch ' },
			{ refinedDescription: 'COFFEE SHOP', suggestedTag: 'Coffee' },
			{ refinedDescription: 'MISSING', suggestedTag: 'Lunch' }
		]);

		expect(rows.map((item) => item.suggestedTag)).toEqual(['new:Lunch', 'Lunch']);
	});
});
