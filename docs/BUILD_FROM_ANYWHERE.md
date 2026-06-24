# Build from anywhere

This project is **cloud-first**: you can contribute from a laptop, a tablet, the
GitHub web editor, a Codespace, or an AI agent in the cloud — without a local
database and without any special infrastructure. Everything you need is the
repo, Node.js, and a browser.

The rules in [`AGENTS.md`](../AGENTS.md) apply everywhere: `main` is protected,
all changes go through a pull request, never commit secrets, and no database is
needed.

---

## The one workflow (works on every surface)

1. **Create a branch** off `main`.
2. **Make your change.**
3. **Run the checks:** `npm run typecheck`, `npm run lint`, `npm run build`.
4. **Open a pull request.** CI runs typecheck, lint, and build automatically.
5. **Merge after review + green required checks.**

You never need a local database — the app talks to hosted Supabase through the
publishable client key in `.env`.

---

## Option 1 — Your own machine (laptop/desktop)

Requires [Node.js](https://nodejs.org) 20+ and git.

```sh
git clone https://github.com/hajrehyseni/stratos-lite.git
cd stratos-lite
npm ci
npm run dev          # http://localhost:8080

# create a branch, make changes, then:
npm run typecheck && npm run lint && npm run build
git checkout -b feat/my-change
git commit -am "feat: my change"
git push -u origin feat/my-change
```

Then open a PR on GitHub.

---

## Option 2 — GitHub Codespaces (zero local setup)

A Codespace is a full dev environment in the cloud, reachable from any browser.

1. On the repo page, click **Code → Codespaces → Create codespace on a branch**
   (or create a branch first).
2. In the Codespace terminal:
   ```sh
   npm ci
   npm run dev
   ```
   Codespaces forwards the port so you can preview the app in your browser.
3. Commit, push, and open a PR from the Codespace's Source Control panel.

---

## Option 3 — Edit directly in the browser (small changes)

For a quick docs or config tweak, no clone needed:

- **Web editor:** press <kbd>.</kbd> (period) on the repo to open
  `github.dev`, edit, then commit **to a new branch** and open a PR.
- **Single file:** click the pencil (✎) on any file. GitHub will offer to
  commit to a new branch and start a PR — accept that; never commit to `main`.

CI still runs on the resulting PR, so typecheck and build are verified for you.

---

## Option 4 — Cloud / AI agent (e.g. Claude Code on the web)

Agents follow the exact same rules:

- Work on a **feature branch**, never `main`.
- Make the change, then open a **pull request** for review.
- **Never commit secrets** — use GitHub Actions secrets or environment
  variables for anything sensitive.
- **No database** is required to build or run the app.

See [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)
for how cloud sessions, triggers, and network policies are configured.

---

## What runs in CI

Every pull request triggers [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

| Step      | Command             | Blocking?           |
| --------- | ------------------- | ------------------- |
| Typecheck | `npm run typecheck` | ✅ required          |
| Lint      | `npm run lint`      | ⚠️ reported only    |
| Build     | `npm run build`     | ✅ required          |

Reproduce CI locally any time with:

```sh
npm run typecheck && npm run lint && npm run build
```

Dependencies are refreshed weekly by
[Dependabot](../.github/dependabot.yml), which opens its own PRs — these run
through the same CI.
