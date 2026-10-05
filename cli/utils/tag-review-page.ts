// Served by `update-tag review`. Loads rows from /data and posts tag edits to /save.

export const TAG_REVIEW_PAGE = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Tag review</title>
<style>
	:root {
		--bg: #fafafa; --card: #fff; --text: #18181b; --muted: #71717a; --border: #e4e4e7;
		--accent: #18181b; --ok: #15803d; --ok-bg: #dcfce7; --err: #b91c1c; --err-bg: #fee2e2;
		--new: #1d4ed8; --new-bg: #dbeafe; --warn: #a16207; --warn-bg: #fef9c3;
		font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; color: var(--text);
	}
	* { box-sizing: border-box; }
	body { margin: 0; background: var(--bg); }
	header {
		position: sticky; top: 0; z-index: 1; background: var(--card); border-bottom: 1px solid var(--border);
		padding: 12px 24px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
	}
	h1 { font-size: 16px; margin: 0; }
	.file { color: var(--muted); font-size: 12px; }
	.spacer { flex: 1; }
	.filters { display: flex; gap: 4px; }
	.filters button, .save {
		border: 1px solid var(--border); background: var(--card); border-radius: 6px;
		padding: 6px 10px; cursor: pointer; font: inherit;
	}
	.filters button[aria-pressed='true'] { background: var(--accent); color: #fff; border-color: var(--accent); }
	.save { background: var(--accent); color: #fff; border-color: var(--accent); }
	.save:disabled { opacity: 0.4; cursor: default; }
	input[type='search'], .tag-input {
		border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font: inherit; width: 100%;
	}
	input[type='search'] { width: 220px; }
	.tag-input:disabled { background: var(--bg); color: var(--muted); }
	.status { color: var(--muted); font-size: 12px; min-width: 120px; }
	main { padding: 16px 24px; }
	table { width: 100%; border-collapse: collapse; background: var(--card); border: 1px solid var(--border); border-radius: 8px; }
	th, td { text-align: left; vertical-align: top; padding: 10px 12px; border-bottom: 1px solid var(--border); }
	th { font-size: 12px; color: var(--muted); font-weight: 500; }
	tr.dirty td:first-child { box-shadow: inset 3px 0 0 var(--new); }
	.desc { font-weight: 600; }
	.note { color: var(--muted); font-size: 12px; margin-top: 4px; }
	.visits { font-variant-numeric: tabular-nums; font-size: 12px; line-height: 1.6; }
	.visits .total { color: var(--muted); }
	.badge { display: inline-block; font-size: 11px; padding: 1px 6px; border-radius: 999px; margin-top: 4px; }
	.badge.new { color: var(--new); background: var(--new-bg); }
	.badge.unknown { color: var(--warn); background: var(--warn-bg); }
	.badge.ok { color: var(--ok); background: var(--ok-bg); }
	.badge.error { color: var(--err); background: var(--err-bg); }
	.error-text { color: var(--err); font-size: 12px; margin-top: 4px; }
	.hint { color: var(--muted); font-size: 12px; margin: 0 0 12px; }
	.empty { text-align: center; color: var(--muted); padding: 32px; }
</style>
</head>
<body>
<header>
	<div>
		<h1>Tag review</h1>
		<div class="file" id="file"></div>
	</div>
	<div class="filters" id="filters"></div>
	<input type="search" id="search" placeholder="Search descriptions" />
	<div class="spacer"></div>
	<span class="status" id="status"></span>
	<button class="save" id="save" disabled>Save</button>
</header>
<main>
	<p class="hint">Pick an existing tag, or type <code>new:Name</code> to create one. Blank rows stay untagged. Save with ⌘S.</p>
	<table>
		<thead><tr><th style="width: 28%">Description</th><th style="width: 30%">Visits</th><th style="width: 26%">Tag</th><th>Result</th></tr></thead>
		<tbody id="rows"></tbody>
	</table>
</main>
<datalist id="tag-options"></datalist>
<script>
	const FILTERS = {
		all: { label: 'All', match: () => true },
		blank: { label: 'Blank', match: (row) => !isDone(row) && row.suggestedTag === '' },
		suggested: { label: 'Tagged', match: (row) => !isDone(row) && row.suggestedTag !== '' },
		errors: { label: 'Errors', match: (row) => row.result === 'error' },
		done: { label: 'Done', match: isDone }
	};

	const state = { rows: [], saved: new Map(), tagKeys: null, filter: 'blank', search: '', saving: false };
	const el = (id) => document.getElementById(id);

	function isDone(row) { return row.result.toLowerCase() === 'ok'; }
	function isDirty(row) { return state.saved.get(row.refinedDescription) !== row.suggestedTag; }
	function dirtyRows() { return state.rows.filter(isDirty); }

	function node(tag, className, text) {
		const element = document.createElement(tag);
		if (className) element.className = className;
		if (text !== undefined) element.textContent = text;
		return element;
	}

	function tagBadge(value) {
		if (value === '') return null;
		if (value.toLowerCase().startsWith('new:')) return node('span', 'badge new', 'new tag');
		if (state.tagKeys && !state.tagKeys.has(value.trim().toLowerCase())) {
			return node('span', 'badge unknown', 'not found, add new:');
		}
		return null;
	}

	function renderVisits(visits) {
		const cell = node('div', 'visits');
		const parts = visits ? visits.split('; ') : [];
		let total = 0;
		for (const part of parts) {
			const [date, weekday, amount] = part.split(' ');
			total += Number(amount) || 0;
			cell.append(node('div', '', weekday + ' ' + date + ' · ' + amount));
		}
		if (parts.length > 1) cell.append(node('div', 'total', parts.length + ' visits · ' + total.toFixed(2)));
		return cell;
	}

	function renderRow(row) {
		const tr = node('tr', isDirty(row) ? 'dirty' : '');

		const description = node('td');
		description.append(node('div', 'desc', row.refinedDescription));
		if (row.note) description.append(node('div', 'note', row.note));

		const visits = node('td');
		visits.append(renderVisits(row.visits));

		const tag = node('td');
		const input = node('input', 'tag-input');
		input.value = row.suggestedTag;
		input.disabled = isDone(row);
		input.setAttribute('list', 'tag-options');
		input.placeholder = 'Leave blank to skip';
		const badgeSlot = node('div');
		const badge = tagBadge(row.suggestedTag);
		if (badge) badgeSlot.append(badge);
		input.addEventListener('input', () => {
			row.suggestedTag = input.value.trim();
			tr.className = isDirty(row) ? 'dirty' : '';
			badgeSlot.replaceChildren(...[tagBadge(row.suggestedTag)].filter(Boolean));
			renderHeader();
		});
		tag.append(input, badgeSlot);

		const result = node('td');
		if (row.result) result.append(node('span', 'badge ' + (isDone(row) ? 'ok' : 'error'), row.result));
		if (row.error) result.append(node('div', 'error-text', row.error));

		tr.append(description, visits, tag, result);
		return tr;
	}

	function renderRows() {
		const search = state.search.toLowerCase();
		const visible = state.rows.filter(
			(row) => FILTERS[state.filter].match(row) && row.refinedDescription.toLowerCase().includes(search)
		);
		const body = el('rows');
		body.replaceChildren(...visible.map(renderRow));
		if (visible.length === 0) {
			const empty = node('tr');
			const cell = node('td', 'empty', 'Nothing here');
			cell.colSpan = 4;
			empty.append(cell);
			body.append(empty);
		}
	}

	function renderHeader() {
		el('filters').replaceChildren(
			...Object.entries(FILTERS).map(([key, filter]) => {
				const count = state.rows.filter(filter.match).length;
				const button = node('button', '', filter.label + ' ' + count);
				button.setAttribute('aria-pressed', String(state.filter === key));
				button.addEventListener('click', () => {
					state.filter = key;
					renderHeader();
					renderRows();
				});
				return button;
			})
		);
		const dirty = dirtyRows().length;
		el('save').disabled = state.saving || dirty === 0;
		el('save').textContent = dirty > 0 ? 'Save ' + dirty : 'Save';
	}

	function setStatus(text) { el('status').textContent = text; }

	async function save() {
		if (state.saving) return;
		const edits = dirtyRows().map(({ refinedDescription, suggestedTag }) => ({ refinedDescription, suggestedTag }));
		if (edits.length === 0) return;

		state.saving = true;
		renderHeader();
		setStatus('Saving…');
		const response = await fetch('/save', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ edits })
		}).catch(() => null);
		state.saving = false;

		if (!response || !response.ok) {
			setStatus('Save failed. Is the CLI still running?');
			renderHeader();
			return;
		}

		for (const edit of edits) state.saved.set(edit.refinedDescription, edit.suggestedTag);
		setStatus('Saved ' + edits.length + ' at ' + new Date().toLocaleTimeString());
		renderHeader();
		renderRows();
	}

	async function load() {
		const response = await fetch('/data');
		const data = await response.json();
		state.rows = data.rows;
		state.saved = new Map(data.rows.map((row) => [row.refinedDescription, row.suggestedTag]));
		state.tagKeys = data.tags ? new Set(data.tags.map((name) => name.toLowerCase())) : null;

		const suggested = data.rows.map((row) => row.suggestedTag).filter(Boolean);
		const options = [...new Set([...(data.tags ?? []), ...suggested])].sort();
		el('tag-options').replaceChildren(...options.map((value) => Object.assign(node('option'), { value })));
		el('file').textContent = data.file + (data.tags ? '' : ' · existing tags not loaded (no cookie)');

		renderHeader();
		renderRows();
	}

	el('save').addEventListener('click', save);
	el('search').addEventListener('input', (event) => {
		state.search = event.target.value;
		renderRows();
	});
	document.addEventListener('keydown', (event) => {
		if ((event.metaKey || event.ctrlKey) && event.key === 's') {
			event.preventDefault();
			save();
		}
	});
	window.addEventListener('beforeunload', (event) => {
		if (dirtyRows().length > 0) event.preventDefault();
	});

	load();
</script>
</body>
</html>
`;
