import { json } from '@sveltejs/kit';
import Papa from 'papaparse';

import type { RequestHandler } from './$types';

const MAX_FILE_SIZE = 3 * 1024 * 1024;

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file');

	if (!(file instanceof File)) {
		return json({ message: 'A CSV file is required' }, { status: 400 });
	}

	if (!file.name.toLowerCase().endsWith('.csv')) {
		return json({ message: 'Only CSV files are supported' }, { status: 400 });
	}

	if (file.size > MAX_FILE_SIZE) {
		return json({ message: 'Files must be 3 MB or smaller' }, { status: 400 });
	}

	const parsed = Papa.parse<Record<string, string>>(await file.text(), {
		header: true,
		skipEmptyLines: 'greedy'
	});

	if (parsed.errors.length > 0) {
		return json({ message: 'The CSV could not be parsed' }, { status: 400 });
	}

	const rowCount = parsed.data.length;
	console.info(`Expense import: ${file.name} contains ${rowCount} data rows`);

	return json({ rowCount });
};
