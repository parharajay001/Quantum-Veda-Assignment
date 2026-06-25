# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Turborepo monorepo managed with **pnpm** (`pnpm@9`, Node >=18) for a task-management product. Workspaces are `apps/*` and `packages/*` (see `pnpm-workspace.yaml`):

- `apps/web` — Next.js 16 (App Router) + React 19 frontend, port 3000.
- `apps/server` — Express 5 + TypeScript REST API, port 3001 (`/health`, `/api/tasks` CRUD).
- `packages/database` (`@repo/database`) — Prisma + PostgreSQL: schema, generated client, and a `prisma` singleton.
- `packages/ui` (`@repo/ui`) — shared React components.
- `packages/eslint-config`, `packages/typescript-config` — shared presets.

(The root README is the unmodified `create-turbo` starter text and references a non-existent `docs` app — ignore it.)

## Commands

Run from the repo root. Turbo fans tasks out across all workspaces; use `--filter` to scope.

- `pnpm dev` — run all dev servers (`web` serves on port 3000)
- `pnpm build` — build all apps/packages
- `pnpm lint` — ESLint across all workspaces (configured with `--max-warnings 0`, so warnings fail)
- `pnpm check-types` — type-check all workspaces (no emit)
- `pnpm format` — Prettier write over all `.ts/.tsx/.md`

Scope to one workspace, e.g. `pnpm turbo dev --filter=web` or `pnpm turbo build --filter=server`.

Local Postgres (Docker, dev only — apps still run on the host):

- `pnpm db:up` — start the Postgres container (`docker compose up -d`).
- `pnpm db:down` — stop it. `pnpm db:reset` — drop the volume and recreate a clean DB.
- Credentials live in `docker-compose.yml` (`user`/`password`/`taskdb`) and must stay in sync with the `DATABASE_URL` in the `.env.example` files.

Database (Prisma, run against `@repo/database`):

- `pnpm db:generate` — regenerate the Prisma client (alias for `turbo run build --filter=@repo/database`; `prisma generate` also runs automatically before any dependent's `build`/`dev`/`check-types` via the topological `^build` dependency).
- `pnpm db:migrate` — `prisma migrate dev` (create/apply a migration in dev).
- `pnpm db:studio` — open Prisma Studio.
- Other Prisma scripts (`db:deploy`, `db:push`) live in `packages/database/package.json`.

Environment files: each app/package has its own `.env.example` — `packages/database` and `apps/server` (`DATABASE_URL`, `PORT`), and `apps/web` (`NEXT_PUBLIC_API_URL`, the backend base URL exposed to the browser). All env keys are declared in `turbo.json` `globalEnv` so Turbo caching and the `turbo/no-undeclared-env-vars` lint rule stay correct — add new keys there too.

First-time setup: `pnpm db:up`, copy each `.env.example` → `.env` (in `packages/database`, `apps/server`, `apps/web`), then `pnpm db:migrate` and `pnpm dev`.

Tests (Jest):

- `pnpm test` — run all suites (`turbo run test`). Scope with `pnpm --filter=server test` / `pnpm --filter=web test`, or `pnpm --filter=server test:watch`.
- Each app owns a `jest.config.mjs`. **`apps/web`** uses `next/jest` (SWC transform, jsdom, React Testing Library; `jest.setup.ts` loads `@testing-library/jest-dom`). **`apps/server`** uses `@swc/jest` (node env) with `supertest` against the `createApp()` factory; the database is mocked via `jest.mock("@repo/database", ...)` so no Postgres is needed.
- Tests live in `__tests__/` folders as `.ts`/`.tsx`; Jest globals are ambient (no per-file imports) via `@types/jest`. In `apps/server`, `jest.mock` must stay at top level so `@swc/jest` hoists it above the imports.

## Architecture

**Shared packages are consumed as raw TypeScript source, not built artifacts.** `@repo/ui` exposes `"./*": "./src/*.tsx"`, so imports are per-file: `import { Button } from "@repo/ui/button"`. There is no build step or barrel/index for the UI package — Next.js transpiles the source directly. Add a new component as `packages/ui/src/<name>.tsx` and it's immediately importable as `@repo/ui/<name>` (or scaffold with `pnpm --filter=@repo/ui generate:component`, which runs `turbo gen react-component`).

Config is centralized in two non-published packages, both referenced via `workspace:*`:

- `@repo/eslint-config` — flat-config presets exported as `./base`, `./next-js`, `./node`, `./react-internal`. Apps/packages import the relevant one into their own `eslint.config.js`. Uses `eslint-plugin-only-warn`, so all rule violations surface as warnings (which `--max-warnings 0` then turns into hard failures).
- `@repo/typescript-config` — base tsconfigs exported as `base.json`, `nextjs.json`, `node.json`, `react-library.json`, extended by each workspace's `tsconfig.json`. Node packages (`server`, `database`) extend `node.json`.

**Database access** goes through `@repo/database`: import the shared singleton with `import { prisma } from "@repo/database"` (the package also re-exports all generated Prisma types/enums like `Task`, `TaskStatus`, `Prisma`). The Prisma client generates into `node_modules` (default location), so `prisma generate` must have run before type-checking — handled by the `^build` chain. Schema lives at `packages/database/prisma/schema.prisma`.

**Server (`apps/server`):** Express 5 app assembled in `src/app.ts` (`createApp()`), started in `src/index.ts`. Routes are `express.Router()` modules under `src/routes/`, request bodies validated with `zod` schemas in `src/schemas/`. Errors are handled centrally in `src/middleware/error.ts` — Express 5 auto-forwards rejected promises from async handlers there; `ZodError` → 400, Prisma `P2025` (not found) → 404. Relative imports use explicit `.js` extensions (NodeNext). Dev uses `tsx watch` (no build step); prod builds with `tsc` to `dist/` and runs `node dist/index.js`.

**Web (`apps/web`):** Next.js 16 (App Router, `apps/web/app/`) + React 19. The web app's `check-types` runs `next typegen && tsc --noEmit` — run typegen before type-checking when route types matter.

## Conventions

- ESM throughout (`"type": "module"`). Shared UI components are client components (`"use client"`).
- Caching: `build` outputs `.next/**` and `dist/**`; `dev` is uncached and persistent (see `turbo.json`). The Turbo TUI is enabled (`"ui": "tui"`). `DATABASE_URL`/`PORT`/`NODE_ENV` are declared in `globalEnv`.

## Branching

Never commit directly to `main`/`master` — create a branch for every change.

- **Name**: `<type>/<short-kebab-summary>`, where `type` is a commit type (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, …). Optionally include a scope: `<type>/<scope>-<summary>`. Examples: `feat/task-filtering`, `fix/health-route-status`, `ci/github-actions`, `chore/server-deps`.
- Branch off the latest default branch; keep each branch focused on one logical change; open a PR to merge.

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): subject`.

- **type** — one of `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`.
- **scope** (optional but encouraged) — the affected workspace, named without the `@repo/` prefix: `web`, `server`, `database`, `ui`, `eslint-config`, `typescript-config`. Use `repo` for monorepo-wide changes (root config, turbo, tooling).
- **subject** — imperative mood, lower-case, no trailing period (e.g. "add task status filter", not "Added ...").
- Breaking changes: append `!` after the type/scope (`feat(database)!: ...`) and/or add a `BREAKING CHANGE:` footer.

Examples:

- `feat(server): add PATCH /api/tasks/:id endpoint`
- `fix(database): correct TaskStatus default to TODO`
- `chore(repo): bump turbo to 2.10`

Keep commits scoped to one logical change; prefer separate commits per workspace when a change spans several.

When a commit needs an extended description, use a body of `-` bullet points (one per change) rather than long prose paragraphs. Short, self-explanatory commits need only the subject line.

Do not add `Co-Authored-By` trailers or any tool/assistant attribution to commit messages.

### Pre-commit hook

A Husky hook (`.husky/pre-commit`) gates every commit: it runs `lint-staged` (prettier `--write` on staged files) then `turbo run lint check-types test build` across all workspaces. Linting is handled by `turbo run lint` (each package has its own `eslint.config.js`; ESLint can't run from the repo root, so it is intentionally not in `lint-staged`). Turbo caches these, so repeat commits are fast. The hook is installed by the root `prepare` script on `pnpm install`. Don't bypass it with `--no-verify` unless explicitly asked.

### CI

GitHub Actions (`.github/workflows/ci.yml`) runs on pushes to `main`/`master` and on every PR. It runs the same gate as the hook — `turbo run lint check-types test build` — on Node 22 with pnpm and a Turbo cache. Tests need no database (Postgres is mocked), so CI runs no service container. Keep the CI suite and the pre-commit suite in sync when changing either.
