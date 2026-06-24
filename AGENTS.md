# AGENTS.md

Working rules for humans and AI agents contributing to this repository. Keep
changes small, reviewable, and safe.

## Golden rules

1. **`main` is protected — never commit or push to it directly.** All work
   happens on a feature branch.
2. **Every change ships through a pull request.** Open a PR, let CI run, and get
   it reviewed before merge. No exceptions, including for agents.
3. **Never commit secrets.** No service-role keys, API secrets, access tokens,
   private keys, or passwords — not in code, config, comments, or commit
   messages. Only the existing `VITE_`-prefixed Supabase **publishable** values
   (anon key, project URL) belong in `.env`; these are client-side and safe to
   ship in the browser bundle. If you need a real secret, use a GitHub Actions
   secret or an environment variable — never a committed file.
4. **No database to set up.** This app talks to hosted Supabase via the
   publishable client key. Do not provision, require, or assume a local
   database to build, run, or test the app. Don't add one as a dependency of
   local development or CI.

## Branching & PRs

- Branch off `main`; use a short descriptive name (e.g. `fix/login-redirect`,
  `feat/risk-matrix-export`).
- Keep PRs focused — one logical change per PR.
- Fill in the [pull request template](./.github/pull_request_template.md).
- A PR is mergeable when required CI checks pass and it has been reviewed.

## Before you push

Run the same checks CI runs, locally:

```sh
npm run typecheck   # tsc -b --noEmit  (required in CI)
npm run lint        # ESLint           (reported, non-blocking in CI)
npm run build       # production build (required in CI)
npm test            # Vitest
```

- **Typecheck and build must pass** — these are required checks.
- **Lint is reported but currently non-blocking** while existing lint debt is
  worked down. Don't add new lint errors; fix what you touch.

## Code conventions

- TypeScript + React function components and hooks.
- UI is built on shadcn/ui primitives in `src/components/ui` and styled with
  Tailwind — prefer composing existing primitives over adding new dependencies.
- Match the style, naming, and structure of the surrounding code.
- Keep imports using the `@/` path alias for `src`.

## What not to do

- Don't push to `main` or merge your own PR without review.
- Don't commit secrets, `.env` files containing real secrets, build output
  (`dist/`), or `node_modules/`.
- Don't introduce a local database requirement.
- Don't disable or weaken CI checks to make a PR pass.
