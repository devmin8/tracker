import * as v from 'valibot';

import type { Command, CommandDefinition } from '$cli/utils/command';
import { normalizeCookie } from '$cli/utils/cookie-helper';
import { loadCliEnv } from '$cli/utils/env';
import { createDb } from '$lib/server/db/create-db';
import { listMonthExpenses } from '$lib/server/expenses';
import { formatYearMonth, parseYearMonth } from '$lib/utils/date';
import { request } from '$lib/utils/request';

type SessionResponse = {
	session: unknown;
	user: { id: string } | null;
} | null;

const deleteExpensesDefinition = {
	name: 'delete-expenses',
	title: 'Delete expenses',
	description:
		'Delete every expense in a calendar month. Ids are read locally, each row is deleted over the API.',
	arguments: [
		{
			name: 'month',
			description: 'Month as YYYY-MM (e.g. 2026-10)',
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

const DeleteExpensesInput = v.object({
	month: v.pipe(
		v.string('A month is required'),
		v.transform((value) => value.trim()),
		v.check((value) => parseYearMonth(value) !== undefined, 'Month must be YYYY-MM (e.g. 2026-10)'),
		v.transform((value) => formatYearMonth(parseYearMonth(value)!))
	),
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

async function resolveUserId(baseUrl: string, cookie: string) {
	const response = await request<SessionResponse>(`${baseUrl}/api/auth/get-session`, {
		headers: { Cookie: cookie, Origin: baseUrl },
		redirect: 'manual'
	});

	if (!response.ok) {
		const status = response.error.status ?? 0;
		if (status === 401 || (status >= 300 && status < 400)) {
			throw new Error('Login cookie was rejected');
		}
		throw new Error(`get-session: ${response.error.message}`);
	}

	const userId = response.result?.user?.id;
	if (!userId) {
		throw new Error('Login cookie was rejected');
	}

	return userId;
}

export const deleteExpensesCommand = {
	definition: deleteExpensesDefinition,
	schema: DeleteExpensesInput,
	async execute({ month, cookie, baseUrl }) {
		const userId = await resolveUserId(baseUrl, cookie);
		const env = loadCliEnv();
		const expenses = await listMonthExpenses(createDb(env.DATABASE_URL), userId, month);

		if (expenses.length === 0) {
			console.log(`${month}: no expenses to delete`);
			return;
		}

		let deleted = 0;
		for (const expense of expenses) {
			const response = await request<{ id: string }>(`${baseUrl}/expenses/${expense.id}`, {
				method: 'DELETE',
				headers: { Cookie: cookie, Origin: baseUrl },
				redirect: 'manual'
			});

			if (!response.ok) {
				const status = response.error.status ?? 0;
				if (status === 401 || (status >= 300 && status < 400)) {
					throw new Error(`${month}: login cookie was rejected`);
				}
				throw new Error(`${month}: could not delete ${expense.id} (${response.error.message})`);
			}

			deleted += 1;
		}

		console.log(`${month}: ${deleted} deleted`);
	}
} satisfies Command<typeof DeleteExpensesInput>;
