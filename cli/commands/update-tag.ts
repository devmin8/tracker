import { spawn } from 'node:child_process';
import { access, readFile, writeFile } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { basename, resolve } from 'node:path';
import * as v from 'valibot';

import type { Command, CommandDefinition } from '$cli/utils/command';
import { normalizeCookie } from '$cli/utils/cookie-helper';
import {
	applyTagEdits,
	createReviewCsv,
	markApplied,
	markFailed,
	parseReviewCsv,
	resolveReviewRow,
	serializeReviewCsv,
	tagNameKey,
	type TagReviewContext,
	type TagReviewRow
} from '$cli/utils/tag-review';
import { TAG_REVIEW_PAGE } from '$cli/utils/tag-review-page';
import type { UntaggedDescription } from '$lib/server/tags';
import { request, type RequestResult } from '$lib/utils/request';
import { safeResolve } from '$lib/utils/safe-resolve';
import { safeTry } from '$lib/utils/safe-try';

const REVIEW_HOST = '127.0.0.1';

type Api = {
	baseUrl: string;
	cookie: string;
};

type TagsResponse = {
	tags: string[];
};

type UntaggedResponse = {
	descriptions: UntaggedDescription[];
};

type UpdateTagResponse = {
	tagId: string;
};

type ApplySummary = {
	applied: number;
	failed: number;
};

type ReviewData = {
	file: string;
	rows: TagReviewRow[];
	tags: string[] | null;
};

const updateTagDefinition = {
	name: 'update-tag',
	title: 'Update tags',
	description:
		'Export untagged descriptions to a CSV, review tags in a local page, or apply the CSV and write ok/error per row.',
	arguments: [
		{
			name: 'mode',
			description: 'export, review or apply',
			required: true
		},
		{
			name: 'file',
			description: 'Tag CSV path',
			required: true
		}
	],
	options: [
		{
			key: 'cookie',
			name: '--cookie <cookie>',
			flag: 'cookie',
			description: 'Session cookie, or set TRACKER_COOKIE (optional for review)',
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

const UpdateTagInput = v.object({
	mode: v.picklist(['export', 'review', 'apply'], 'Mode must be export, review or apply'),
	file: v.pipe(
		v.string('A file is required'),
		v.nonEmpty('A file is required'),
		v.transform(resolve)
	),
	cookie: v.optional(v.pipe(v.string(), v.transform(normalizeCookie))),
	baseUrl: v.pipe(
		v.string('An app origin is required'),
		v.nonEmpty('An app origin is required'),
		v.transform((value) => value.replace(/\/$/, ''))
	)
});

const SaveEditsSchema = v.object({
	edits: v.array(v.object({ refinedDescription: v.string(), suggestedTag: v.string() }))
});

// == api ==

async function apiGet<T>(api: Api, path: string): Promise<T> {
	const response = await request<T>(`${api.baseUrl}${path}`, {
		headers: { Cookie: api.cookie, Origin: api.baseUrl },
		redirect: 'manual'
	});

	if (response.ok) return response.result;

	assertCookieAccepted(response);
	throw new Error(`${path}: ${response.error.message}`);
}

async function postTag(api: Api, refinedDescription: string, name: string) {
	return request<UpdateTagResponse>(`${api.baseUrl}/expenses/tags`, {
		method: 'POST',
		headers: {
			Cookie: api.cookie,
			Origin: api.baseUrl,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ name, refinedDescription }),
		redirect: 'manual'
	});
}

function assertCookieAccepted(response: RequestResult<unknown>) {
	if (response.ok) return;

	const status = response.error.status ?? 0;
	if (status === 401 || (status >= 300 && status < 400)) {
		throw new Error('Login cookie was rejected');
	}
}

// == csv file ==

async function readRows(file: string) {
	const parsed = parseReviewCsv(await readFile(file, 'utf8'));
	if (!parsed.ok) {
		throw new Error(`${basename(file)}: ${parsed.message}`);
	}

	return parsed.rows;
}

async function writeRows(file: string, rows: TagReviewRow[]) {
	await writeFile(file, serializeReviewCsv(rows));
}

// == export ==

async function exportTags(api: Api, file: string) {
	const exists = await safeResolve(() => access(file));
	if (exists.ok) {
		throw new Error(`${file} already exists; pick another file or delete it`);
	}

	const { tags } = await apiGet<TagsResponse>(api, '/expenses/tags');
	const { descriptions } = await apiGet<UntaggedResponse>(api, '/expenses/tags/untagged');

	await writeFile(file, createReviewCsv(descriptions));

	console.log(`Existing tags: ${tags.length > 0 ? tags.join(', ') : '(none)'}`);
	console.log(`${descriptions.length} untagged descriptions → ${file}`);
}

// == review ==

async function reviewTags(api: Api | undefined, file: string) {
	await readRows(file);
	const tags = api ? (await apiGet<TagsResponse>(api, '/expenses/tags')).tags : null;

	// Serialize reads and saves so each edit is applied to the latest complete CSV.
	let pendingRequests = Promise.resolve();
	const server = createServer((req, res) => {
		pendingRequests = pendingRequests.then(async () => {
			const outcome = await safeResolve(() => handleReviewRequest(req, res, file, tags));
			if (!outcome.ok) {
				sendJson(res, 500, {
					message: outcome.error instanceof Error ? outcome.error.message : 'Request failed'
				});
			}
		});
	});

	await new Promise<void>((done) => server.listen(0, REVIEW_HOST, done));
	const { port } = server.address() as AddressInfo;
	const url = `http://${REVIEW_HOST}:${port}`;

	console.log(`Reviewing ${file}`);
	console.log(`Open ${url}. Press Ctrl+C to stop.`);
	spawn('open', [url], { stdio: 'ignore' }).on('error', () => undefined);

	await new Promise<void>((done) => {
		process.once('SIGINT', () => server.close(() => done()));
	});
}

async function handleReviewRequest(
	req: IncomingMessage,
	res: ServerResponse,
	file: string,
	tags: string[] | null
) {
	if (req.method === 'GET' && req.url === '/') {
		res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
		res.end(TAG_REVIEW_PAGE);
		return;
	}

	if (req.method === 'GET' && req.url === '/data') {
		const data: ReviewData = { file: basename(file), rows: await readRows(file), tags };
		sendJson(res, 200, data);
		return;
	}

	// A JSON content type forces a CORS preflight, so other sites can't post here.
	if (req.method === 'POST' && req.url === '/save') {
		if (req.headers['content-type'] !== 'application/json') {
			sendJson(res, 415, { message: 'Expected JSON' });
			return;
		}

		const text = await readBody(req);
		const body = safeTry((): unknown => JSON.parse(text));
		const parsed = v.safeParse(SaveEditsSchema, body.ok ? body.result : undefined);
		if (!parsed.success) {
			sendJson(res, 400, { message: 'Invalid edits' });
			return;
		}

		const rows = await readRows(file);
		applyTagEdits(rows, parsed.output.edits);
		await writeRows(file, rows);
		sendJson(res, 200, { saved: parsed.output.edits.length });
		return;
	}

	sendJson(res, 404, { message: 'Not found' });
}

async function readBody(req: IncomingMessage) {
	let body = '';
	for await (const chunk of req) body += chunk;
	return body;
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
	res.writeHead(status, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(body));
}

// == apply ==

async function applyTags(api: Api, file: string) {
	const rows = await readRows(file);
	const { tags } = await apiGet<TagsResponse>(api, '/expenses/tags');
	const { descriptions } = await apiGet<UntaggedResponse>(api, '/expenses/tags/untagged');
	const context: TagReviewContext = {
		tagsByKey: new Map(tags.map((name) => [tagNameKey(name), name])),
		untagged: new Set(descriptions.map((description) => description.refinedDescription))
	};

	const summary: ApplySummary = { applied: 0, failed: 0 };
	for (const row of rows) {
		const changed = await applyRow(api, row, context, summary);
		if (changed) await writeRows(file, rows);
	}

	console.log(`${basename(file)}: ${summary.applied} applied, ${summary.failed} failed`);
}

async function applyRow(
	api: Api,
	row: TagReviewRow,
	context: TagReviewContext,
	summary: ApplySummary
): Promise<boolean> {
	const decision = resolveReviewRow(row, context);
	if (decision.kind === 'ignore') return false;

	if (decision.kind === 'error') {
		markFailed(row, decision.message);
		summary.failed += 1;
		return true;
	}

	const posted = await postTag(api, row.refinedDescription, decision.tagName);
	if (!posted.ok) {
		assertCookieAccepted(posted);
		markFailed(row, posted.error.message);
		summary.failed += 1;
		return true;
	}

	context.tagsByKey.set(tagNameKey(decision.tagName), decision.tagName);
	context.untagged.delete(row.refinedDescription);
	markApplied(row);
	summary.applied += 1;
	return true;
}

// == command ==

function requireApi(cookie: string | undefined, baseUrl: string): Api {
	if (!cookie) {
		throw new Error('A session cookie is required: pass --cookie or set TRACKER_COOKIE');
	}

	return { cookie, baseUrl };
}

export const updateTagCommand = {
	definition: updateTagDefinition,
	schema: UpdateTagInput,
	async execute({ mode, file, cookie, baseUrl }) {
		if (mode === 'review') {
			await reviewTags(cookie ? { cookie, baseUrl } : undefined, file);
		} else if (mode === 'export') {
			await exportTags(requireApi(cookie, baseUrl), file);
		} else {
			await applyTags(requireApi(cookie, baseUrl), file);
		}
	}
} satisfies Command<typeof UpdateTagInput>;
