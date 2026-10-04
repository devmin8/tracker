# Update tag

Bulk-tag untagged expenses. The CLI runs outside the app and only uses its API.

## Inputs

- **Context file**: tag rules (merchants, tag names). Personal data, never in git. The user supplies its path when asking; if missing, ask for it. Don't guess tags without it.
- **CSV**: exports contain merchants and amounts. Write them to `.misc/data/` (git-excluded), never elsewhere in the repo.

## When the user asks to tag expenses

1. Export: `pnpm cli update-tag export .misc/data/untagged-<yyyy-mm-dd>.csv`.
2. Fill `suggested_tag` and `note` for every row using the context file. Leave `suggested_tag` blank when unsure.
3. Stop. Tell the user to run `pnpm cli update-tag review <file>` and fill the blanks.
4. Before applying, flag rows that look like slips (a tag that contradicts the context file). Apply only when the user says so: `pnpm cli update-tag apply <file>`.
5. Report the rows with `result=error`.

Never edit `refined_description`, `visits`, `result` or `error`.

## Commands

| Command         | Does                                                       | Cookie                                |
| --------------- | ---------------------------------------------------------- | ------------------------------------- |
| `export <file>` | Writes untagged descriptions. Won't overwrite a file.      | Yes                                   |
| `review <file>` | Opens a local page to edit tags. Save writes the same CSV. | Optional, loads tags for the dropdown |
| `apply <file>`  | Saves tags, writes `ok` or `error` per row.                | Yes                                   |

The cookie comes from `TRACKER_COOKIE`. If it's unset, ask the user to set it; never read or print it.

## CSV

```csv
refined_description,visits,suggested_tag,note,result,error
LUNCH PLACE,2026-09-15 Tue 18.07; 2026-09-17 Thu 20.32,Office day,Weekday visits,,
COFFEE SHOP,2026-09-19 Sat 4.50,new:Cafe,Fits no tag,,
SQ *SHOP,2026-09-18 Fri 12.00,,Unknown Square merchant,,
```

| Column                | Written by  | Meaning                                   |
| --------------------- | ----------- | ----------------------------------------- |
| `refined_description` | export      | Key.                                      |
| `visits`              | export      | `date weekday amount`, separated by `; `. |
| `suggested_tag`       | agent, user | Tag to apply. Blank means leave untagged. |
| `note`                | agent       | Why this tag.                             |
| `result`              | apply       | `ok` or `error`.                          |
| `error`               | apply       | Failure reason.                           |

## Tag values

- `Lunch`: existing tag, matched case-insensitively. Fails with `tag not found` otherwise.
- `new:Groceries`: creates the tag, then links it. Use only for tags missing from the export's "Existing tags" list.

## Apply rules

- Applies rows with a `suggested_tag` and no `result=ok`. Rerunning is safe.
- A row tagged in the app after export fails with `already tagged`.
- One failed row doesn't stop the others.

## Users

Tags are per user. The CLI only touches the cookie owner's data.
