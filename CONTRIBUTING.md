# Contributing

## Branching & PRs

- Work from `develop` as the main integration branch.
- Create feature branches from `develop`: `feature/...`, `fix/...`, `test/...`.
- Open PRs into `develop`. Keep PRs focused and include a short description and testing notes.

## Commits

- Use Conventional Commits (e.g. `feat:`, `fix:`, `chore:`, `docs:`).

## Local setup

1. Install [Bun](https://bun.sh) (preferred) or Node LTS 20.x.
2. Copy `.env.example` to `.env` in both `frontend/` and `backend/` and fill in values.
3. Install dependencies:
   ```bash
   cd frontend && bun install
   cd backend && bun install
   ```
4. Run TypeORM migrations: `cd backend && bun run migration:run`
5. Seed Pokémon data: `cd backend && bun run seed` *(~8–12 min first run; idempotent)*
6. Start dev servers:
   ```bash
   cd frontend && bun run dev      # Vite on :5173
   cd backend && bun run start:dev # NestJS on :3000
   ```

If you can't use Bun, substitute `npm install` / `npm run <script>` throughout.

## Local checks before opening a PR

- `cd frontend && bun run build` — must succeed (no TypeScript errors, no Vite build errors).
- `cd frontend && bun run test` — all Vitest tests pass.
- `cd backend && bun run build` — NestJS TypeScript compilation succeeds.
- `cd backend && bun run test` — all backend tests pass.
- `bun run lint` in each package — zero ESLint warnings/errors.

## Security

- Don't commit secrets. Use GitHub Secrets for CI and Supabase CLI keys.
- Required environment variables are documented in `.env.example` files.
