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
- Run `db:migrate` to apply generated migrations to the database.

# Docker

```bash
docker compose build
docker compose up
```

Open http://localhost:3000. Public signup is disabled; create a user in the running container (password prompt):

```bash
docker compose exec -it web node build/scripts/create-user.js --email test@test.com --name "Test user"
```
