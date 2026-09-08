# Tracker

An expense tracker application build for my personal use using sveltekit.

# How to run

- Install [portless](https://portless.sh/).
- Run `pnpm install`.
- Run `pnpm dev`
- Open https://tracker.localhost in browser.

# DB migration commands

- Run `db:push` to push schema changes directly to the database.
- Run `db:generate` to generate SQL migration files from schema changes.
- Run `db:migrate` to apply generated migrations to the database.
