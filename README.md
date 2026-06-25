# Taskly

A full-stack task-management app with a drag-and-drop kanban board, built as a typed **Turborepo** monorepo: a Next.js 16 frontend, an Express 5 REST API, and PostgreSQL via Prisma.

Plan work across four status columns, assign it to teammates, filter and search, and switch between light and dark — on any screen size.

![Taskly board — dark theme](docs/screenshots/board-dark.png)

## Highlights

- **Drag-and-drop kanban** across four columns (Backlog → To Do → In Progress → Done), powered by [@dnd-kit](https://dndkit.com/).
- **Full task CRUD** with title, description, priority, due date, and assignee — created and edited in an accessible modal.
- **Live filtering** by search text, status, priority, and assignee; on mobile the filters collapse behind a toggle so the board stays in view.
- **Authentication & roles** — register/login issue a signed JWT stored in an **httpOnly cookie**; every task and user endpoint is guarded. Users are `ADMIN` or `MEMBER`.
- **Responsive from 320px up** with a collapsible sidebar (off-canvas sheet on mobile) and full **light/dark** theming.
- **Typed end to end** — shared Prisma types flow from the database package into both apps; no `any` at the boundaries.
- **Tested & gated** — Jest + React Testing Library + supertest, with Husky pre-commit/pre-push hooks and GitHub Actions CI running the same `lint · check-types · test · build` suite.
- **Structured logging** — a shared winston logger on the server and a browser-safe client logger.

## Screenshots

| Board (light)                                           | New task dialog                                              |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| ![Board, light theme](docs/screenshots/board-light.png) | ![Create/edit task dialog](docs/screenshots/task-dialog.png) |

| Sign in                                             | Mobile (filters expanded)                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| ![Split-screen sign in](docs/screenshots/login.png) | <img src="docs/screenshots/mobile-filters.png" alt="Responsive mobile board" width="280" /> |

## Tech stack

**Frontend** — Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn-style UI primitives · @dnd-kit · next-themes

**Backend** — Express 5 · TypeScript · Zod validation · JWT (`jsonwebtoken`) + httpOnly cookies · cookie-parser · CORS

**Data** — PostgreSQL 16 · Prisma 6 (client + migrations + seed)

**Tooling** — Turborepo 2 · pnpm 9 · Jest + React Testing Library + supertest · ESLint · Prettier · Husky + lint-staged · GitHub Actions · Docker Compose

## Architecture

A pnpm + Turborepo monorepo. Apps live in `apps/*`, shared packages in `packages/*`.

```text
my-turborepo/
├─ apps/
│  ├─ web/         Next.js 16 frontend            (http://localhost:3000)
│  └─ server/      Express 5 REST API             (http://localhost:3001)
├─ packages/
│  ├─ database/    Prisma schema, client & seed   (@repo/database)
│  ├─ logger/      winston server + client logger (@repo/logger)
│  ├─ ui/          shared React components        (@repo/ui)
│  ├─ eslint-config/
│  └─ typescript-config/
└─ docker-compose.yml   Postgres 16 for local dev
```

**Design decisions**

- **Layered server, organized by feature.** Each feature under `apps/server/src/modules/<feature>/` owns a vertical slice: `routes → controller → service → validation`. Routes wire HTTP to controllers; controllers are thin; **all business logic and Prisma access live in services**; Zod schemas validate every write. Errors are handled centrally (`ZodError → 400`, Prisma `P2025 → 404`).
- **Cookie-based auth.** Login/register return a JWT set as an httpOnly cookie, so tokens are never exposed to JavaScript. CORS is credentialed against a single explicit `WEB_ORIGIN`.
- **Shared TypeScript source, no build step.** `@repo/ui` and `@repo/database` are consumed as raw TS — Next.js and the server transpile them directly, so types stay in sync without a publish/build cycle.
- **TDD workflow.** Features and fixes start with a failing test (RTL for the web, supertest against the Express app with Prisma mocked for the server), then the minimum code to pass.
- **Caching & guardrails.** Turborepo caches `lint`/`check-types`/`test`/`build`; the same suite runs in Husky hooks and CI, so broken code can't be committed or merged.

> More conventions (branching, commit format, module layout) are documented in [`CLAUDE.md`](CLAUDE.md).

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** 9 — enable via `corepack enable`
- **Docker Desktop** (for the local Postgres container)

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL (Docker)
pnpm db:up

# 3. Create env files from the examples (one per app/package)
cp packages/database/.env.example packages/database/.env
cp apps/server/.env.example       apps/server/.env
cp apps/web/.env.example          apps/web/.env

# 4. Apply migrations and seed demo data (5 users + sample tasks)
pnpm db:migrate
pnpm db:seed

# 5. Run everything (web + server)
pnpm dev
```

Then open **`http://localhost:3000`**. The API runs at **`http://localhost:3001`** (health check: `GET /health`).

> On Windows, `cp` is available in Git Bash; in PowerShell use `Copy-Item`.

## Default logins

The seed creates five accounts — all share the password **`password123`** (development only).

| Email               | Role   | Password      |
| ------------------- | ------ | ------------- |
| `admin@taskly.dev`  | ADMIN  | `password123` |
| `priya@taskly.dev`  | MEMBER | `password123` |
| `rohan@taskly.dev`  | MEMBER | `password123` |
| `ananya@taskly.dev` | MEMBER | `password123` |
| `vikram@taskly.dev` | MEMBER | `password123` |

The seed is idempotent — re-running `pnpm db:seed` upserts users and resets the sample tasks.

## Environment variables

Each app/package has its own `.env.example`. Every key is also declared in `turbo.json` `globalEnv`.

**`apps/web`**

| Variable                | Description                                          | Example                 |
| ----------------------- | ---------------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`   | Base URL of the backend API (exposed to the browser) | `http://localhost:3001` |
| `NEXT_PUBLIC_LOG_LEVEL` | Minimum level for the browser client logger          | `info`                  |

**`apps/server`**

| Variable         | Description                                                  | Example                                                          |
| ---------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `PORT`           | Port the API listens on                                      | `3001`                                                           |
| `DATABASE_URL`   | PostgreSQL connection string                                 | `postgresql://user:password@localhost:5432/taskdb?schema=public` |
| `LOG_LEVEL`      | Minimum level for the winston logger                         | `debug`                                                          |
| `JWT_SECRET`     | Secret used to sign/verify JWTs (use a strong value in prod) | `dev-only-insecure-jwt-secret`                                   |
| `JWT_EXPIRES_IN` | JWT lifetime (`vercel/ms` format)                            | `7d`                                                             |
| `WEB_ORIGIN`     | Web app origin allowed by credentialed CORS                  | `http://localhost:3000`                                          |

**`packages/database`**

| Variable       | Description                                       | Example                                                          |
| -------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string (used by Prisma CLI) | `postgresql://user:password@localhost:5432/taskdb?schema=public` |

> The Postgres credentials live in `docker-compose.yml` (`user` / `password` / `taskdb`) and must stay in sync with `DATABASE_URL`.

## API reference

Base URL: `http://localhost:3001`. Auth endpoints set/clear the session cookie; protected routes require it.

| Method   | Path                 | Auth | Description                                                     |
| -------- | -------------------- | :--: | --------------------------------------------------------------- |
| `POST`   | `/api/auth/register` |  —   | Create an account, returns the user and sets the session cookie |
| `POST`   | `/api/auth/login`    |  —   | Log in, sets the session cookie                                 |
| `POST`   | `/api/auth/logout`   |  ✅  | Clear the session cookie                                        |
| `GET`    | `/api/auth/me`       |  ✅  | Current user's full profile                                     |
| `GET`    | `/api/tasks`         |  ✅  | List tasks                                                      |
| `GET`    | `/api/tasks/:id`     |  ✅  | Get a task by id                                                |
| `POST`   | `/api/tasks`         |  ✅  | Create a task                                                   |
| `PATCH`  | `/api/tasks/:id`     |  ✅  | Update a task                                                   |
| `DELETE` | `/api/tasks/:id`     |  ✅  | Delete a task                                                   |
| `GET`    | `/api/users`         |  ✅  | List users (for assignment)                                     |
| `GET`    | `/health`            |  —   | Health check                                                    |

## Scripts

Run from the repo root; Turborepo fans tasks out across workspaces (scope with `--filter`).

| Script                   | What it does                                        |
| ------------------------ | --------------------------------------------------- |
| `pnpm dev`               | Run all dev servers (web on :3000, server on :3001) |
| `pnpm build`             | Build all apps and packages                         |
| `pnpm lint`              | ESLint across all workspaces (`--max-warnings 0`)   |
| `pnpm check-types`       | Type-check all workspaces (no emit)                 |
| `pnpm test`              | Run all Jest suites                                 |
| `pnpm format`            | Prettier-write all `.ts/.tsx/.md`                   |
| `pnpm db:up` / `db:down` | Start / stop the Postgres container                 |
| `pnpm db:reset`          | Drop the volume and recreate a clean database       |
| `pnpm db:migrate`        | Create/apply a Prisma migration (dev)               |
| `pnpm db:seed`           | Seed the dev database (5 users + sample tasks)      |
| `pnpm db:generate`       | Regenerate the Prisma client                        |
| `pnpm db:studio`         | Open Prisma Studio                                  |

Scope to one workspace, e.g. `pnpm turbo dev --filter=web` or `pnpm --filter=server test`.

## Testing

```bash
pnpm test                  # all suites
pnpm --filter=web test     # web only (React Testing Library + next/jest)
pnpm --filter=server test  # server only (supertest against the Express app)
```

- **Server tests** run against the `createApp()` factory with `@repo/database` **mocked**, so no database is required.
- **Web tests** use React Testing Library and assert behaviour/roles, not implementation details.
- The Husky **pre-commit** and **pre-push** hooks, and **GitHub Actions CI**, all run `turbo run lint check-types test build` — keep `pnpm test` green before pushing.

## Project structure

```text
apps/
  web/            app/ (routes), components/, lib/
  server/         src/modules/<feature>/{routes,controller,service,validation}, middleware/, config/
packages/
  database/       prisma/{schema.prisma, seed.ts}, generated client
  logger/         server (winston) + client loggers
  ui/             components/ui/* shadcn-style primitives, hooks/
  eslint-config/  shared flat-config presets
  typescript-config/  shared tsconfig bases
```

---

Conventions for branching, commits, and adding features are documented in [`CLAUDE.md`](CLAUDE.md).
