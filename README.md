[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/2ljl1.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

# CamDex

A personal Pokémon collection tracker. Track every obtainable form in a HOME-style living dex, organise caught Pokémon into PC boxes, and build competitive teams with full EV/SP validation.

## Features

- **Living Form Dex** — HOME-style box grid for every trackable form, with caught/uncaught overlay, shiny toggle, filter bar, and jump-to-box navigation
- **PC Boxes** — 30-slot boxes with drag-and-drop reordering; backend enforces each Pokémon can only occupy one slot
- **Team Builder** — 6-slot teams with move, EV, tera-type, and held-item editing; game-aware EV rules (standard 252/508 or Champions 32/66), Item Clause enforced for Champions games
- **Pokédex** — Full species browser with search, type filter, stat bars, and type matchup chart
- **Dashboard** — Per-dex completion rings pulled live from the API

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite |
| Routing | TanStack Router |
| Server state | TanStack Query |
| Styles | CSS Modules |
| Backend | NestJS + TypeORM |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth (RS256 JWT verified locally) |
| Runtime / pkg manager | Bun |
| Testing | Vitest + Testing Library + MSW (frontend), Jest (backend) |

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.0
- A [Supabase](https://supabase.com) project (free tier is fine)

## Setup

### 1. Clone

```bash
git clone https://github.com/cambboyle/CamDex.git
cd CamDex
```

### 2. Backend environment

```bash
cp backend/.env.example backend/.env
```

Fill in `backend/.env`:

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → **Session mode** pooler connection string |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_JWT_SECRET` | Supabase → Settings → API → JWT Secret |
| `FRONTEND_URL` | `http://localhost:5173` for local dev |

> **Tip:** Use the **Session mode** pooler URL (`aws-0-<region>.pooler.supabase.com:5432`), not the direct connection. The username format is `postgres.<project-ref>`.

### 3. Frontend environment

```bash
cp frontend/.env.example frontend/.env
```

Fill in `frontend/.env`:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` / `public` key |

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

This creates all tables (`pokemon_species`, `pokemon_forms`, `user_profiles`, `user_pokemon`, `boxes`, `box_slots`, `teams`, `team_members`, `dexes`, `dex_entries`).

### 6. Seed Pokémon data

```bash
cd backend
bun run seed
```

Fetches ~1 025 species and ~1 800+ forms from PokéAPI and inserts them into your database. The script is **idempotent** — safe to run multiple times. First run takes roughly 8–12 minutes due to PokéAPI rate limits.

### 7. Start development servers

In two separate terminals:

```bash
# Terminal 1 — backend (port 3000)
cd backend
bun run start:dev

# Terminal 2 — frontend (port 5173)
cd frontend
bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Running Tests

```bash
# Backend (Jest — 39 unit tests)
cd backend && bun run test

# Frontend (Vitest + MSW)
cd frontend && bun run test
```

## Useful Scripts

| Location | Command | What it does |
|---|---|---|
| `backend/` | `bun run migration:run` | Apply all pending migrations |
| `backend/` | `bun run migration:revert` | Roll back the last migration |
| `backend/` | `bun run seed` | Sync Pokémon data from PokéAPI |
| `backend/` | `bun run start:dev` | Start backend with hot reload |
| `backend/` | `bun run test` | Run backend unit tests |
| `frontend/` | `bun run dev` | Start frontend dev server |
| `frontend/` | `bun run build` | Production build |
| `frontend/` | `bun run lint` | ESLint check |
| `frontend/` | `bun run test` | Run frontend tests |

## Environment Variables Reference

### `backend/.env`

```env
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_JWT_SECRET=<from Supabase dashboard>
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
DB_LOGGING=false   # set to "true" to log SQL queries
```

### `frontend/.env`

```env
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>
```
