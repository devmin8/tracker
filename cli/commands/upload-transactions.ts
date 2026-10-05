import { openAsBlob } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import * as v from 'valibot';

import type { Command, CommandDefinition } from '$cli/utils/command';
import { normalizeCookie } from '$cli/utils/cookie-helper';
import { request } from '$lib/utils/request';

const MONTHS = [
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

const FILE_NAME_PATTERN =
	/^(?:\d+\.)?\s*([A-Za-z]{3}\s+\d{1,2},\s+\d{4})\s+(?:-|to)\s+([A-Za-z]{3}\s+\d{1,2},\s+\d{4}|today)\.csv$/i;

const NAMED_DATE_PATTERN = /^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/i;

type DateRangeFile = {
	path: string;
	name: string;
	start: Date;
	end: Date;
};

type MonthUpload = {
	month: string;
	files: DateRangeFile[];
};

type UploadResponse = {
	rowCount: number;
};

const uploadTransactionsDefinition = {
	name: 'upload-transactions',
	title: 'Upload transactions',
	description: 'Upload CSV statements, grouping files that overlap the same calendar month.',
	arguments: [
		{
			name: 'folder',
			description: 'Folder containing CSV statements',
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

const UploadTransactionsInput = v.object({
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

function parseNamedDate(value: string, today: Date) {
	if (value.toLowerCase() === 'today') {
		return new Date(today.getFullYear(), today.getMonth(), today.getDate());
	}

	const match = NAMED_DATE_PATTERN.exec(value.trim());
	if (!match) return undefined;

	const monthIndex = MONTHS.findIndex((month) => month.toLowerCase() === match[1]!.toLowerCase());
	const day = Number(match[2]);
	const year = Number(match[3]);
	if (monthIndex < 0) return undefined;

	const date = new Date(year, monthIndex, day);
	if (date.getFullYear() !== year || date.getMonth() !== monthIndex || date.getDate() !== day) {
		return undefined;
	}

	return date;
}

function parseCsvFileName(name: string, today: Date) {
	const match = FILE_NAME_PATTERN.exec(name);
	if (!match) return undefined;

	const start = parseNamedDate(match[1]!, today);
	const end = parseNamedDate(match[2]!, today);
	if (!start || !end || start > end) return undefined;

	return { start, end };
}

function yearMonthKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthsOverlapping(start: Date, end: Date) {
	const months: string[] = [];
	const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
	const last = new Date(end.getFullYear(), end.getMonth(), 1);

	while (cursor <= last) {
		months.push(yearMonthKey(cursor));
		cursor.setMonth(cursor.getMonth() + 1);
	}

	return months;
}

function groupFilesByMonth(files: DateRangeFile[]): MonthUpload[] {
	const filesByMonth = new Map<string, DateRangeFile[]>();

	for (const file of files) {
		for (const month of monthsOverlapping(file.start, file.end)) {
			const existing = filesByMonth.get(month);
			if (existing) {
				existing.push(file);
			} else {
				filesByMonth.set(month, [file]);
			}
		}
	}

	return [...filesByMonth.entries()]
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([month, monthFiles]) => ({
			month,
			files: monthFiles.toSorted((left, right) => left.start.getTime() - right.start.getTime())
		}));
}

async function loadCsvFiles(folder: string, today: Date) {
	const entries = await readdir(folder, { withFileTypes: true });
	const files: DateRangeFile[] = [];

	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.csv')) continue;

		const parsed = parseCsvFileName(entry.name, today);
		if (!parsed) {
			throw new Error(`Unrecognized CSV name: ${entry.name}`);
		}

		files.push({
			path: resolve(folder, entry.name),
			name: entry.name,
			start: parsed.start,
			end: parsed.end
		});
	}

	if (files.length === 0) {
		throw new Error(`No CSV files found in ${folder}`);
	}

	return files.toSorted((left, right) => left.start.getTime() - right.start.getTime());
}

async function uploadMonth(baseUrl: string, cookie: string, upload: MonthUpload) {
	const form = new FormData();
	for (const file of upload.files) {
		form.append('files', await openAsBlob(file.path, { type: 'text/csv' }), file.name);
	}
	form.append('month', upload.month);

	const response = await request<UploadResponse>(`${baseUrl}/transactions/upload`, {
		method: 'POST',
		headers: {
			Cookie: cookie,
			Origin: baseUrl
		},
		body: form,
		redirect: 'manual'
	});

	if (!response.ok) {
		const status = response.error.status ?? 0;
		if (status === 401 || (status >= 300 && status < 400)) {
			throw new Error(`${upload.month}: login cookie was rejected`);
		}
		throw new Error(`${upload.month}: ${response.error.message}`);
	}

	return response.result.rowCount;
}

export const uploadTransactionsCommand = {
	definition: uploadTransactionsDefinition,
	schema: UploadTransactionsInput,
	async execute({ folder, cookie, baseUrl }) {
		const files = await loadCsvFiles(folder, new Date());
		const uploads = groupFilesByMonth(files);

		console.log(`Folder ${folder}`);
		console.log(`${files.length} files → ${uploads.length} months\n`);

		for (const upload of uploads) {
			const names = upload.files.map((file) => basename(file.path)).join(', ');
			const rowCount = await uploadMonth(baseUrl, cookie, upload);
			console.log(`${upload.month}: ${rowCount} rows (${names})`);
		}
	}
} satisfies Command<typeof UploadTransactionsInput>;
