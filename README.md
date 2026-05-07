# CamDex

A personal Pokémon collection tracker built for one player. Track every obtainable form across a HOME-style living dex, build competitive teams with full EV/SP validation, and browse the full Pokédex — all backed by a live PostgreSQL database seeded from PokéAPI.

**Live:** [camdex.vercel.app](https://camdex.vercel.app)

---

## Features

| Feature | Details |
|---|---|
| **Living Form Dex** | HOME-style box grid for every trackable form (~1 800+). Caught/uncaught overlay, shiny mode, filter bar (All / Caught / Uncaught), jump-to-box dropdown. 3-column responsive layout. |
| **Multiple Dexes** | Create a dex per game or per goal. Each dex tracks its own caught state independently. |
| **Team Builder** | 6-slot teams with moves, EVs, held items, and tera type. Game-aware rules: standard games enforce 252/stat and 508 total; Pokémon Champions enforces 32/stat and 66 total with Item Clause. |
| **Pokédex** | Full species browser with search, generation and type filters, base stat bars, and a type matchup chart. |
| **Dashboard** | Per-dex completion rings updated live from the API. |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Routing | TanStack Router (file-based) |
| Server state | TanStack Query v5 |
| Tables | TanStack Table |
| Styles | CSS Modules |
| Backend | NestJS 11 + TypeORM |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth — RS256 JWT verified locally (no network roundtrip per request) |
| Runtime / pkg manager | Bun |
| Hosting | Vercel (frontend) + Railway (backend) |
| Observability | BetterStack Logtail + Vercel Analytics |
| Testing | Vitest + Testing Library + MSW (frontend) · Jest + ts-jest (backend) |

---

## Project Structure

```
CamDex/
├── frontend/                  # Vite + React SPA
│   ├── src/
│   │   ├── api/               # Typed fetch wrappers (client, dex, teams, pokemon…)
│   │   ├── components/        # Shared UI (AppShell, TypeBadge, StatBar…)
│   │   ├── hooks/             # TanStack Query hooks
│   │   ├── lib/               # supabase.ts, typeMatchups.ts, formatters.ts, logger.ts
│   │   ├── routes/            # File-based routes (TanStack Router)
│   │   │   ├── _app/          # Authenticated layout
│   │   │   │   ├── index.tsx          # Dashboard
│   │   │   │   ├── dex/               # Dex list + box view
│   │   │   │   ├── pokedex/           # Species browser + detail
│   │   │   │   └── teams/             # Team list + builder
│   │   │   └── auth/login.tsx
│   │   └── types/             # Shared TypeScript interfaces
│   ├── src/tests/             # Vitest tests + MSW handlers
│   └── vercel.json            # SPA rewrite + /api proxy to Railway
│
├── backend/                   # NestJS API
│   ├── src/
│   │   ├── auth/              # JwtAuthGuard, /auth/sync, /auth/me
│   │   ├── user/              # /users/me
│   │   ├── pokemon/           # /pokemon/species, /pokemon/forms, sync service
│   │   ├── collection/        # /collection, living-dex endpoint
│   │   ├── dex/               # /dex — per-game dex tracking
│   │   ├── team/              # /teams — team builder with EV validation
│   │   └── common/            # JSON logger, HTTP interceptor, exception filter
│   ├── scripts/
│   │   └── seed-pokemon.ts    # PokéAPI → DB sync (idempotent)
│   └── Dockerfile             # Single-stage Bun build for Railway
│
└── .github/workflows/
    ├── ci.yml                 # Lint + build + test on every push
    ├── deploy-backend.yml     # Railway deploy on backend/** changes
    └── deploy-frontend.yml    # Vercel deploy on frontend/** changes
```

---

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.1
- A [Supabase](https://supabase.com) project (free tier works fine)
- Node.js ≥ 18 (only needed for `npm` fallback — Bun handles everything else)

---

## Local Setup

### 1. Clone

```bash
git clone https://github.com/cambboyle/CamDex.git
cd CamDex
```

### 2. Backend environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in:

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → **Session mode** pooler URI (`aws-0-<region>.pooler.supabase.com:5432`) |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_JWT_SECRET` | Supabase → Settings → API → JWT Secret (click Reveal) |
| `FRONTEND_URL` | `http://localhost:5173` for local dev |

> **Database URL tip:** Use the **Session mode** pooler (username format `postgres.<project-ref>`), not the direct connection. The pooler handles SSL automatically.

Optional:

| Variable | Default | Purpose |
|---|---|---|
| `DB_LOGGING` | `false` | Set `true` to log every SQL query to stdout |
| `BETTERSTACK_TOKEN` | — | BetterStack Logtail source token for log shipping |

### 3. Frontend environment

```bash
cp frontend/.env.example frontend/.env
```

Open `frontend/.env` and fill in:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` / `public` key |

> The anon key is safe to expose — it's the same key shipped in the browser bundle in production.

### 4. Install dependencies

```bash
cd backend && bun install && cd ..
cd frontend && bun install && cd ..
```

### 5. Run database migrations

```bash
cd backend
bun run migration:run
```

Creates all tables: `pokemon_species`, `pokemon_forms`, `user_profiles`, `user_pokemon`, `teams`, `team_members`, `dexes`, `dex_entries`.

### 6. Seed Pokémon data

```bash
cd backend
bun run seed
```

Fetches ~1 025 species and ~1 800+ forms from PokéAPI and upserts them into your database. The script is **idempotent** — safe to re-run after PokéAPI updates. First run takes approximately 8–12 minutes due to rate limits.

### 7. Start development servers

```bash
# Terminal 1 — backend (hot reload, port 3000)
cd backend && bun run start:dev

# Terminal 2 — frontend (HMR, port 5173)
cd frontend && bun run dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in with your Supabase credentials.

---

## Running Tests

```bash
# Backend — Jest unit tests (47 tests)
cd backend && bun run test

# Frontend — Vitest + MSW (30 tests)
cd frontend && bun run test
```

Test coverage includes:
- **Backend**: `TeamService` (EV/SP limits, Item Clause, slot bounds, access control), `DexService` (form filtering, stats, caught status), `CollectionService` (add, duplicate prevention, update, remove, ownership)
- **Frontend**: dex hooks (fetch, create, delete, toggle caught), team hooks (fetch, create, delete), type matchup scoring, text formatters

---

## Scripts Reference

### Backend (`cd backend`)

| Command | What it does |
|---|---|
| `bun run start:dev` | Start with hot reload (development) |
| `bun run build` | Compile TypeScript to `dist/` |
| `bun run test` | Run all unit tests |
| `bun run test:cov` | Run tests with coverage report |
| `bun run migration:run` | Apply all pending TypeORM migrations |
| `bun run migration:revert` | Roll back the last migration |
| `bun run migration:generate` | Generate a new migration from entity changes |
| `bun run seed` | Sync Pokémon data from PokéAPI |
| `bun run lint` | ESLint check + auto-fix |

### Frontend (`cd frontend`)

| Command | What it does |
|---|---|
| `bun run dev` | Start Vite dev server (port 5173) |
| `bun run build` | Production build to `dist/` |
| `bun run preview` | Preview the production build locally |
| `bun run test` | Run Vitest tests |
| `bun run test:watch` | Run tests in watch mode |
| `bun run typecheck` | TypeScript check without emitting |
| `bun run lint` | ESLint check |

---

## API Overview

All endpoints require a valid Supabase JWT (`Authorization: Bearer <token>`). The global `JwtAuthGuard` verifies the RS256 signature locally — no Supabase network call per request.

```
POST /auth/sync          Create/update user profile on first login
GET  /auth/me            Current user profile

GET  /pokemon/species    Paginated species list (?search=&type=&gen=)
GET  /pokemon/species/:id
GET  /pokemon/forms/:id
GET  /pokemon/types

GET    /collection       User's caught Pokémon
POST   /collection       Add a Pokémon to the collection
PATCH  /collection/:id
DELETE /collection/:id
GET    /collection/living-dex  All forms with caught status + stats

GET    /dex              List all dexes
POST   /dex              Create a dex
PATCH  /dex/:id
DELETE /dex/:id
GET    /dex/:id/all      All box entries (used by the box view)
GET    /dex/:id/stats    Completion stats
POST   /dex/:id/entries/:formId   Mark form as caught
DELETE /dex/:id/entries/:formId   Mark form as uncaught

GET    /teams
POST   /teams
PATCH  /teams/:id
DELETE /teams/:id
GET    /teams/:id/members
PUT    /teams/:id/members/:slot
DELETE /teams/:id/members/:slot

GET    /users/me
PATCH  /users/me
```

---

## Deployment

### Frontend — Vercel

The frontend deploys automatically on push to `main` when files under `frontend/` change. The Vercel project is configured to:
- Build with `npm run build` (Vite)
- Proxy `/api/*` → Railway backend via `vercel.json` rewrite
- Serve the SPA from `/index.html` for all other routes

Required GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### Backend — Railway

The backend deploys automatically on push to `main` when files under `backend/` change. Railway builds the Docker image (single-stage `oven/bun:1`, TypeScript compiled via `tsc`), runs migrations on startup, and binds to `0.0.0.0:$PORT`.

Required Railway variables: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`.

Required GitHub secret: `RAILWAY_TOKEN`, `RAILWAY_SERVICE_NAME`.

---

## Observability

| Tool | What it covers |
|---|---|
| **BetterStack Logtail** (backend) | Every HTTP request (`method`, `path`, `status_code`, `duration_ms`, `user_id`), all errors with stack traces and `error_type`, app startup events. Set `BETTERSTACK_TOKEN` in Railway variables. |
| **BetterStack Logtail** (frontend) | Unhandled JS errors and promise rejections shipped from the browser. Set `VITE_BETTERSTACK_TOKEN` in Vercel environment variables. |
| **BetterStack Uptime** | Public status page monitoring the live app. |
| **Vercel Analytics** | Page view tracking, Web Vitals, geographic breakdown. |

All backend logs are structured JSON — queryable in BetterStack with fields like `status_code >= 400` or `duration_ms > 1000`.

---

## Architecture Notes

- **JWT verified locally** — `SUPABASE_JWT_SECRET` is used to verify RS256 tokens synchronously in `JwtAuthGuard`. No roundtrip to Supabase per request.
- **Sprites as URLs** — PokéAPI official artwork URLs are stored in the database, not self-hosted. Front sprite is used as fallback for forms without artwork.
- **`living_dex_order` stored in DB** — Sort order is pre-computed as `(dex_number × 1000) + form_priority` and stored so the living dex query stays a single `ORDER BY` with no runtime logic.
- **Single LEFT JOIN for dex pages** — The full ~1 800-row living dex with caught status is fetched in one query rather than N+1 form lookups.
- **EVs per `team_members`, not `user_pokemon`** — The same Pokémon can carry different EV spreads on different teams, which is standard VGC practice.
- **Game-aware EV validation** — `TeamService.upsertMember` reads the team's `game` field to determine limits (standard: 252/stat, 508 total; Champions: 32/stat, 66 total) and enforces Item Clause only for Champions games.
