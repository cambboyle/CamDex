# Contributing to CamDex

## Branch strategy

```
main       ← production; only receives merges from develop
develop    ← integration; all feature work lands here first
feat/*     ← new features, branched from develop
fix/*      ← bug fixes, branched from develop
chore/*    ← maintenance, dependency bumps, config, branched from develop
test/*     ← adding or improving tests, branched from develop
docs/*     ← documentation only, branched from develop
```

`main` and `develop` are both protected — direct pushes are blocked; changes must arrive via pull request with CI passing.

---

## Day-to-day workflow

### Starting new work

```bash
git checkout develop
git pull origin develop
git checkout -b feat/my-feature   # or fix/, chore/, etc.
```

### While working

Commit little and often with [Conventional Commits](#commit-style). Push your branch whenever you like — it won't affect anyone until a PR is opened.

### Opening a PR

- Target: **`develop`** (never `main` directly)
- Title: one-line summary using the same prefix as your commits (`feat:`, `fix:`, etc.)
- Description: what changed, why, and how to test it
- CI must be green before merging

### Releasing to production

When `develop` is stable and ready to ship, open a PR from **`develop` → `main`**. Merge it — that's a release. No separate release branches or tags required for now.

---

## Commit style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short description>

<optional body — explain the why, not the what>
```

| Type | When to use |
|---|---|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `chore` | Maintenance, dependencies, config |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `refactor` | Code change with no behaviour change |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace (no logic change) |

**Examples:**

```
feat(dex): add caught/uncaught filter bar and jump-to-box select
fix(teams): cap Sword/Shield picker at national dex #898
chore: remove orphaned /living-dex route and stale collection hooks
docs: write full setup guide in README
```

Keep the subject line under 72 characters. Use the body to explain *why* if the change isn't obvious.

---

## Local setup

1. Install [Bun](https://bun.sh) ≥ 1.0 and a [Supabase](https://supabase.com) project.

2. Clone and enter the repo:
   ```bash
   git clone https://github.com/cambboyle/CamDex.git
   cd CamDex
   git checkout develop
   ```

3. Copy and fill in environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   See `README.md` for where to find each value in the Supabase dashboard.

4. Install dependencies:
   ```bash
   cd backend && bun install
   cd frontend && bun install
   ```

5. Run migrations and seed Pokémon data:
   ```bash
   cd backend
   bun run migration:run
   bun run seed        # ~8–12 min first run; idempotent
   ```

6. Start dev servers (two terminals):
   ```bash
   cd backend && bun run start:dev   # NestJS on :3000
   cd frontend && bun run dev        # Vite on :5173
   ```

---

## Before opening a PR

All of these must pass:

```bash
# Frontend
cd frontend
bun run tsc --noEmit   # zero TypeScript errors
bun run lint           # zero ESLint errors
bun run test           # all Vitest tests pass
bun run build          # production build succeeds

# Backend
cd backend
bun run lint           # zero ESLint errors
bun run test           # all Jest tests pass
bun run build          # NestJS compilation succeeds
```

CI runs the same checks automatically — a failing check blocks the merge.

---

## Security

- Never commit secrets. Use `.env` locally; GitHub Secrets for CI.
- All environment variables are documented in `backend/.env.example` and `frontend/.env.example`.
- The backend verifies Supabase JWTs locally (no network call per request) using `SUPABASE_JWT_SECRET`.
