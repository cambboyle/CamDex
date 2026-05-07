import { http, HttpResponse } from 'msw'

// ── Shared fixtures ───────────────────────────────────────────────────────────

export const MOCK_DEX_ID = 'dex-00000000-0000-0000-0000-000000000001'
export const MOCK_FORM_ID = 'form-00000000-0000-0000-0000-000000000001'
export const MOCK_TEAM_ID = 'team-00000000-0000-0000-0000-000000000001'

const mockDexSummary = {
  id: MOCK_DEX_ID,
  name: 'My Living Dex',
  game: 'home',
  isShiny: false,
  includeForms: false,
  includeCosmeticForms: false,
}

const mockDexConfig = {
  ...mockDexSummary,
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  stats: { total: 100, caught: 42, completionPercent: 42 },
}

const mockEntry = {
  formId: MOCK_FORM_ID,
  displayName: 'Bulbasaur',
  spriteUrl: 'https://example.com/bulbasaur.png',
  spriteShinyUrl: null,
  spriteFrontUrl: null,
  type1: 'grass',
  type2: 'poison',
  livingDexOrder: 1000,
  nationalDexNumber: 1,
  speciesName: 'Bulbasaur',
  caughtAt: null,
}

const mockSpecies = {
  id: 'species-1',
  nationalDexNumber: 1,
  name: 'bulbasaur',
  displayName: 'Bulbasaur',
  generation: 1,
  isLegendary: false,
  isMythical: false,
  isBaby: false,
  type1: 'grass',
  type2: 'poison',
}

const mockTeam = {
  id: MOCK_TEAM_ID,
  userId: 'user-1',
  name: 'My Team',
  game: 'scarlet-violet',
  format: 'vgc-2025',
  notes: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockMember = {
  id: 'member-1',
  teamId: MOCK_TEAM_ID,
  slot: 1,
  userPokemonId: null,
  heldItem: null,
  move1: null,
  move2: null,
  move3: null,
  move4: null,
  teraType: null,
  evHp: 0,
  evAtk: 0,
  evDef: 0,
  evSpa: 0,
  evSpd: 0,
  evSpe: 0,
}

// ── Handlers ──────────────────────────────────────────────────────────────────

export const handlers = [
  // ── Dex ───────────────────────────────────────────────────────────────────

  // List dexes
  http.get('/api/dex', () => HttpResponse.json([mockDexConfig])),

  // Create dex
  http.post('/api/dex', () => HttpResponse.json(mockDexConfig, { status: 201 })),

  // Delete dex
  http.delete('/api/dex/:id', () => new HttpResponse(null, { status: 204 })),

  // Fetch all entries for a dex
  http.get('/api/dex/:id/all', () =>
    HttpResponse.json({
      dex: mockDexSummary,
      entries: [mockEntry],
      total: 1,
    }),
  ),

  // Dex stats
  http.get('/api/dex/:id/stats', () =>
    HttpResponse.json({ total: 100, caught: 42, completionPercent: 42 }),
  ),

  // Mark caught
  http.post('/api/dex/:dexId/entries/:formId', () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Mark uncaught
  http.delete('/api/dex/:dexId/entries/:formId', () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Check caught status for a batch of form IDs
  // First form ID in the list is returned as caught, the rest as uncaught.
  http.get('/api/dex/:dexId/entries/check', ({ request }) => {
    const url = new URL(request.url)
    const formIds = (url.searchParams.get('formIds') ?? '').split(',').filter(Boolean)
    const result = Object.fromEntries(formIds.map((id, i) => [id, i === 0]))
    return HttpResponse.json(result)
  }),

  // ── Auth ──────────────────────────────────────────────────────────────────

  http.get('/api/auth/me', () =>
    HttpResponse.json({ id: 'user-1', email: 'test@example.com' }),
  ),

  // ── Pokemon ───────────────────────────────────────────────────────────────

  http.get('/api/pokemon/species', () =>
    HttpResponse.json({ data: [mockSpecies], total: 1, page: 1, limit: 20 }),
  ),

  // ── Teams ─────────────────────────────────────────────────────────────────

  // List teams
  http.get('/api/teams', () => HttpResponse.json([mockTeam])),

  // Create team
  http.post('/api/teams', () => HttpResponse.json(mockTeam, { status: 201 })),

  // Get team by id
  http.get('/api/teams/:id', () => HttpResponse.json(mockTeam)),

  // Update team
  http.patch('/api/teams/:id', () => HttpResponse.json(mockTeam)),

  // Delete team
  http.delete('/api/teams/:id', () => new HttpResponse(null, { status: 204 })),

  // Get team members
  http.get('/api/teams/:id/members', () => HttpResponse.json([mockMember])),

  // Upsert team member at slot
  http.put('/api/teams/:id/members/:slot', () => HttpResponse.json(mockMember)),

  // Remove team member at slot
  http.delete('/api/teams/:id/members/:slot', () =>
    new HttpResponse(null, { status: 204 }),
  ),
]
