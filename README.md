# StratOS Lite

**AI Decision Audit for Executives.** Get a strategic confidence score for your
toughest decisions — MECE analysis, a risk matrix, and stakeholder mapping,
powered by AI.

This is a single-page web app built with Vite, React, and TypeScript. It runs
entirely in the browser and talks to a hosted [Supabase](https://supabase.com)
backend (auth + edge functions) — there is **no local database to run**.

## Tech stack

| Area        | Choice                                   |
| ----------- | ---------------------------------------- |
| Build tool  | [Vite](https://vitejs.dev)               |
| Language    | [TypeScript](https://www.typescriptlang.org) |
| UI          | [React 18](https://react.dev) + [shadcn/ui](https://ui.shadcn.com) |
| Styling     | [Tailwind CSS](https://tailwindcss.com)  |
| Data        | [TanStack Query](https://tanstack.com/query) |
| Backend     | [Supabase](https://supabase.com) (hosted) |
| Tests       | [Vitest](https://vitest.dev) + Testing Library |

## Getting started

You need [Node.js](https://nodejs.org) 20+ and npm.

```sh
# 1. Install dependencies
npm ci

# 2. Start the dev server (http://localhost:8080 by default)
npm run dev
```

### Environment variables

The app reads its Supabase connection from `VITE_`-prefixed env vars (see
`.env`). These are **client-side publishable values** (the Supabase anon key and
project URL) that ship in the browser bundle — they are not secrets. Never add
service-role keys, API secrets, or passwords to `.env` or any committed file.
See [`AGENTS.md`](./AGENTS.md).

| Variable                       | Description                          |
| ------------------------------ | ------------------------------------ |
| `VITE_SUPABASE_URL`            | Supabase project URL                 |
| `VITE_SUPABASE_PROJECT_ID`     | Supabase project ID                  |
| `VITE_SUPABASE_PUBLISHABLE_KEY`| Supabase publishable (anon) key      |

## Scripts

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the Vite dev server                 |
| `npm run build`     | Production build to `dist/`               |
| `npm run preview`   | Preview the production build locally      |
| `npm run typecheck` | Type-check the project (`tsc -b --noEmit`)|
| `npm run lint`      | Run ESLint                                |
| `npm test`          | Run the test suite once (Vitest)          |
| `npm run test:watch`| Run tests in watch mode                   |

## Contributing & workflow

`main` is protected. **All changes land through pull requests** — see
[`AGENTS.md`](./AGENTS.md) for the working rules and
[`docs/BUILD_FROM_ANYWHERE.md`](./docs/BUILD_FROM_ANYWHERE.md) for how to
contribute from any device (laptop, GitHub web editor, Codespaces, or the
cloud).

Every pull request runs CI (typecheck, lint, and build) automatically via
[GitHub Actions](./.github/workflows/ci.yml). Dependencies are kept current by
[Dependabot](./.github/dependabot.yml) on a weekly schedule.

## Project structure

```
src/
  components/   Reusable UI + shadcn primitives
  contexts/     React context providers (e.g. auth)
  hooks/        Custom React hooks
  integrations/ Supabase client and generated types
  lib/          Shared utilities
  pages/        Route-level screens
  test/         Test setup and helpers
supabase/
  functions/    Edge functions (e.g. audit)
  migrations/   Database migrations (managed in Supabase)
```
