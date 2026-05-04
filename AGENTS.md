## Project

This repository is a full-stack TypeScript application for tracking a personal Pokémon collection — specifically a National Living Form Dex (every obtainable form of every Pokémon), PC box management, and competitive team building for Pokémon Champions (VGC-style).

Frontend lives in `frontend/`. Backend lives in `backend/`. Guidance for agents lives in `instructions/`.

Tech stack (short):

- Frontend: React + TypeScript, Vite, TanStack Router / Query / Table, CSS Modules.
- Backend: NestJS patterns + TypeORM-style usage, PostgreSQL (Supabase hosting) and Supabase Auth.
- Tooling: Bun as runtime/package manager (fallback to npm if Bun unavailable); Vite for the frontend dev server.

## Quick commands (build / lint / test)

- Install dependencies: `bun install` (run in the package folder, e.g. `cd frontend && bun install`).
- Frontend dev: `cd frontend && bun run dev` (runs `vite`).
- Frontend build: `cd frontend && bun run build` (runs `vite build`).
- Frontend preview: `cd frontend && bun run preview`.
- Backend:
  - `cd backend && bun run start:dev` — start NestJS in watch mode
  - `cd backend && bun run build` — compile TypeScript
  - `cd backend && bun run start` — run compiled backend
  - `cd backend && bun run migration:run` — run TypeORM migrations

- Lint / format:
  - `bun run lint` or `npx eslint . --ext .ts,.tsx --fix`
  - `bun run format` or `npx prettier --write "**/*.{ts,tsx,js,css,md,json}"`

- Tests:
  - Vitest: `bun run vitest` or `npx vitest` (single file: `npx vitest path/to/file.spec.ts`; single test: `npx vitest -t "name"`).
  - Bun test: `bun test` (if configured).

- Run a single test quickly: find the runner from `package.json` devDependencies. If uncertain, run `grep -E "vitest|jest|bun test" -R frontend` to spot the runner.

## Where to read more

- Frontend guidance: `instructions/frontend.instructions.md` — TanStack patterns, CSS Modules, virtual lists, auth flow.
- Backend guidance: `instructions/backend.instructions.md` — NestJS module patterns, TypeORM, Supabase Auth JWT guard, PokéAPI sync.
- CI: `.github/workflows/ci.yml` shows CI steps and required environment variables.

## Global coding conventions (for agents)

- Language: TypeScript only for new source code. Keep dev tooling configs (JSON, YAML) as needed.
- Prefer small, single-purpose files and functions; extract helpers for repeated logic.
- Follow existing folder structure and naming patterns when adding code.

### Imports

- Order: external packages → internal/absolute aliases (`@/`) → relative imports → styles/assets.
- Use named imports when possible. Avoid `import * as` unless namespacing makes sense.
- Avoid deep relative paths (`../../..`). Add `paths` to `tsconfig.json` and document it if needed.

### Types & TypeScript

- Prefer explicit return types on exported functions and service methods: `async function foo(): Promise<Foo> {}`.
- Use `type` for React props and small aliases; `interface` for open-ended shapes that may be extended.
- Avoid `any`. Prefer `unknown` and narrow before use. Add a `// TODO` with justification when `any` is unavoidable.
- Use discriminated unions for variant data and exhaustive `switch` with `never` for unreachable branches.

### Naming

- Files & React components: PascalCase (e.g. `PokemonCard.tsx`).
- Hooks: `use` prefix + camelCase (e.g. `useDexesQuery`, `useToggleCaught`).
- Services / classes: PascalCase, file `pokemon.service.ts`.
- DTOs: suffix with `Dto` (e.g. `CreateUserPokemonDto`).
- Variables / functions: camelCase. Constants: UPPER_SNAKE (global-only) or PascalCase for exported enums.

### Frontend-specific

- Components: function components using hooks; split presentational vs container logic.
- Use TanStack Query for remote/server state; keep local UI state minimal.
- Query keys: use the `*_KEYS` constants defined in each hook file (e.g. `DEX_KEYS`, `BOX_KEYS`, `TEAM_KEYS`). Avoid bare string arrays. Current namespaces: `['dexes']`, `['dex-all', id]`, `['dex-stats', id]`, `['pokedex']`, `['species', id]`, `['boxes']`, `['box-slots', id]`, `['teams']`, `['team', id]`.
- CSS Modules: name `ComponentName.module.css`, import as `import styles from './ComponentName.module.css'`.
- Keep class names semantic: `dexCard`, `formCell`, `boxSlot`, `typeBadge`.
- Use `@tanstack/react-virtual` for lists/grids with more than ~200 items.

### Backend / NestJS-specific

- Organize by domain modules: `auth`, `user`, `pokemon`, `collection`, `box`, `team`.
- Each module: `*.module.ts`, `*.service.ts`, `*.controller.ts`, `entities/`, `dto/`, and mappers/helpers when needed.
- Keep controllers thin: map request → service call → response. Business logic belongs in services.
- Use `class-validator` decorators in DTOs and throw NestJS `HttpException` types (`NotFoundException`, `BadRequestException`, `ConflictException`) for expected errors.
- Use TypeORM repositories / DataSource for DB access. Use explicit transactions for multi-step writes.
- Verify Supabase JWTs locally using `SUPABASE_JWT_SECRET` (RS256 signature check) — do not call Supabase per-request.

### Error handling & logging

- Do not leak stack traces or internal details to API consumers.
- Translate domain errors into HTTP responses at the service/controller boundary.
- Log unexpected errors with context (request id, user id) but exclude secrets from logs.

### Async / concurrency

- Prefer `async/await` and typed `Promise<T>` signatures.
- Use DB transactions for multi-step writes; keep transactions short and explicit.
- Batch external HTTP requests (e.g. PokéAPI sync) — 20 concurrent, 500 ms delay between batches.

### Tests & mocking

- Frontend: prefer Testing Library + Vitest and MSW for network mocking.
- Backend unit tests: mock repositories. Integration tests should use a test DB and reset state between runs.

### Developer workflow & commits

- Branch strategy: `main` (production) ← `develop` (integration) ← `feat/*`, `fix/*`, `chore/*`, `test/*`, `docs/*`. See `CONTRIBUTING.md` for the full workflow.
- Always branch from `develop`; open PRs into `develop`; only `develop → main` PRs constitute a release.
- Commit style: Conventional Commits (e.g. `feat(dex): add filter bar`, `fix(teams): cap SwSh at dex #898`).
- When changing architecture (tsconfig, ESLint, Vitest config), include a short rationale in the PR description and update this AGENTS.md.

## CI / automation notes

- New scripts must be reflected in `.github/workflows/ci.yml`.
- Avoid secrets in code; use GitHub Secrets for CI and Supabase CLI keys. Document required env vars in README or CI workflows.

## If you are an autonomous agent

- Read `instructions/frontend.instructions.md` and `instructions/backend.instructions.md` before making changes.
- Run the project's tests locally (or a single failing test) using the runner in `package.json`.
- When in doubt, make small, focused commits and include tests for behaviour changes.

Keep this file concise and update it as conventions evolve.
