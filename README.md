# Tracker

An expense tracker application build for my personal use using sveltekit.

# How to run

- Install [portless](https://portless.sh/).
- Copy `.env.example` to `.env` and set `BETTER_AUTH_SECRET` (`openssl rand -hex 32`).
- Run `pnpm install`.
- Run `pnpm dev`
- Open https://tracker.localhost in browser.

# DB migration commands

- Run `db:push` to push schema changes directly to the database.
- Run `db:generate` to generate SQL migration files from schema changes.
- Run `pnpm cli migrate-db` to apply generated migrations to the database.
- Run `pnpm cli reset-db --email <email> --name <name>` to delete the database, re-apply migrations and create a user (password prompt).
- Run `pnpm cli create-user --email <email> --name <name>` to create a user (password prompt).

# Docker

```bash
docker compose build
docker compose up
```

Open http://localhost:3000. Public signup is disabled; create a user in the running container (password prompt):

```bash
docker exec -it <container_id> node build/cli/main.js create-user --email you@example.com  --name "Your Name"
```
