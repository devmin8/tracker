import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import Papa from 'papaparse';
import * as v from 'valibot';

import type { Command, CommandDefinition } from '$cli/utils/command';
import { normalizeCookie } from '$cli/utils/cookie-helper';
import { CreateExpenseSchema } from '$lib/schemas/create-expense.schema';
import { request } from '$lib/utils/request';

const STATUS_COLUMN = 3;
const UPLOADED_STATUS = 'ok';
const STATUS_HEADER = 'status';

type CsvFile = {
	path: string;
	name: string;
};

type PostExpenseResult = { ok: true } | { ok: false; message: string };

type ExpenseValues = {
	amount: string;
	expenseDate: string;
	description: string;
};

type PendingExpense = {
	index: number;
	values: ExpenseValues;
};

type ExpenseCsv = {
	rows: string[][];
	headerIndex: number | undefined;
	pending: PendingExpense[];
	failed: number;
	dirty: boolean;
};

type LoadCsvResult = { ok: true; csv: ExpenseCsv } | { ok: false; message: string };

const uploadExpenseDefinition = {
	name: 'upload-expense',
	title: 'Upload expenses',
	description:
		'Read expense CSVs, post new or failed rows, and write ok/error status back into each file.',
	arguments: [
		{
			name: 'folder',
			description: 'Folder containing expense CSV files',
			required: true
		}
	],
	options: [
		{
			key: 'cookie',
			name: '--cookie <cookie>',
			flag: 'cookie',
			description: 'Session cookie, or set TRACKER_COOKIE',
			required: true,
			env: 'TRACKER_COOKIE'
		},
		{
			key: 'baseUrl',
			name: '--base-url <url>',
			flag: 'base-url',
			description: 'App origin (default: http://tracker.localhost)',
			env: 'TRACKER_BASE_URL',
			defaultValue: 'http://tracker.localhost'
		}
	]
} satisfies CommandDefinition;

const UploadExpenseInput = v.object({
	folder: v.pipe(v.string(), v.nonEmpty('A folder is required'), v.transform(resolve)),
	cookie: v.pipe(
		v.string('A session cookie is required'),
		v.transform(normalizeCookie),
		v.string('A session cookie is required'),
		v.nonEmpty('A session cookie is required')
	),
	baseUrl: v.pipe(
		v.string('An app origin is required'),
		v.nonEmpty('An app origin is required'),
		v.transform((value) => value.replace(/\/$/, ''))
	)
});

async function loadCsvFiles(folder: string) {
	const entries = await readdir(folder, { withFileTypes: true });
	const files: CsvFile[] = [];

	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.csv')) continue;

		files.push({
			path: resolve(folder, entry.name),
			name: entry.name
		});
	}

	if (files.length === 0) {
		throw new Error(`No CSV files found in ${folder}`);
	}

	return files.toSorted((left, right) => left.name.localeCompare(right.name));
}

function loadExpenseCsv(text: string): LoadCsvResult {
	const parsed = Papa.parse<string[]>(text.replace(/^\uFEFF/, ''), {
		delimiter: ',',
		skipEmptyLines: false
	});

	if (parsed.errors.length > 0) {
		return { ok: false, message: 'The CSV could not be parsed' };
	}

	const rows = parsed.data.map((cols) => [...(cols ?? [])]);
	const pending: PendingExpense[] = [];
	let headerIndex: number | undefined;
	let expenseCount = 0;
	let failed = 0;
	let dirty = false;

	for (const [index, cells] of rows.entries()) {
		if (isBlankRow(cells)) continue;

		if (headerIndex === undefined && expenseCount === 0 && isHeaderRow(cells)) {
			headerIndex = index;
			continue;
		}

		expenseCount += 1;
		if (isUploaded(rowStatus(cells))) continue;

		const values = readExpenseValues(cells);
		const parsedRow = v.safeParse(CreateExpenseSchema, values);
		if (!parsedRow.success) {
			failed += 1;
			if (setRowStatus(cells, parsedRow.issues[0]?.message ?? 'Invalid expense')) {
				dirty = true;
			}
			continue;
		}

		pending.push({
			index,
			values: {
				amount: values.amount,
				expenseDate: parsedRow.output.expenseDate,
				description: values.description
			}
		});
	}

	if (expenseCount === 0) {
		return { ok: false, message: 'No expenses found' };
	}

	return { ok: true, csv: { rows, headerIndex, pending, failed, dirty } };
}

async function saveExpenseCsv(path: string, csv: ExpenseCsv) {
	if (csv.headerIndex !== undefined) {
		const header = csv.rows[csv.headerIndex];
		if (header) setRowStatus(header, STATUS_HEADER);
	}

	await writeFile(path, Papa.unparse(csv.rows, { delimiter: ',', newline: '\n' }));
	csv.dirty = false;
}

async function postExpense(
	baseUrl: string,
	cookie: string,
	fileName: string,
	expense: PendingExpense
): Promise<PostExpenseResult> {
	const response = await request(`${baseUrl}/expenses/add`, {
		method: 'POST',
		headers: {
			Cookie: cookie,
			Origin: baseUrl,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(expense.values),
		redirect: 'manual'
	});

	if (!response.ok) {
		const status = response.error.status ?? 0;
		if (status === 401 || (status >= 300 && status < 400)) {
			throw new Error(`${fileName}: login cookie was rejected`);
		}
		return { ok: false, message: response.error.message };
	}

	return { ok: true };
}

async function uploadFile(file: CsvFile, cookie: string, baseUrl: string) {
	const loaded = loadExpenseCsv(await readFile(file.path, 'utf8'));
	if (!loaded.ok) {
		throw new Error(`${file.name}: ${loaded.message}`);
	}

	const { csv } = loaded;
	if (csv.dirty) {
		await saveExpenseCsv(file.path, csv);
	}

	let added = 0;
	let failed = csv.failed;

	for (const expense of csv.pending) {
		const posted = await postExpense(baseUrl, cookie, file.name, expense);
		const status = posted.ok ? UPLOADED_STATUS : posted.message;
		const cells = csv.rows[expense.index];
		if (cells && setRowStatus(cells, status)) {
			await saveExpenseCsv(file.path, csv);
		}

		if (posted.ok) added += 1;
		else failed += 1;
	}

	console.log(`${file.name}: ${added} added, ${failed} failed`);
}

function readExpenseValues(cells: string[]) {
	const [rawDate = '', rawDescription = '', rawAmount = ''] = cells;
	return {
		amount: rawAmount.trim(),
		expenseDate: rawDate.trim(),
		description: rawDescription
	};
}

function rowStatus(cells: string[]) {
	return cells[STATUS_COLUMN]?.trim() ?? '';
}

function isUploaded(status: string) {
	return status.toLowerCase() === UPLOADED_STATUS;
}

function setRowStatus(cells: string[], status: string) {
	if (cells.length > STATUS_COLUMN && cells[STATUS_COLUMN] === status) return false;

	while (cells.length < STATUS_COLUMN) cells.push('');
	cells[STATUS_COLUMN] = status;
	return true;
}

function isBlankRow(cols: string[] | undefined) {
	return !cols || cols.every((col) => (col ?? '').trim() === '');
}

function isHeaderRow(cols: string[]) {
	const [date, description, amount] = cols;
	return (
		date?.trim().toLowerCase() === 'date' &&
		description?.trim().toLowerCase() === 'description' &&
		amount?.trim().toLowerCase() === 'amount'
	);
}

export const uploadExpenseCommand = {
	definition: uploadExpenseDefinition,
	schema: UploadExpenseInput,
	async execute({ folder, cookie, baseUrl }) {
		const files = await loadCsvFiles(folder);

		console.log(`Folder ${folder}`);
		console.log(`${files.length} files\n`);

		for (const file of files) {
			await uploadFile(file, cookie, baseUrl);
		}
	}
} satisfies Command<typeof UploadExpenseInput>;
