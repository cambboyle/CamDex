import { http, HttpResponse } from 'msw'

// ── Shared fixtures ───────────────────────────────────────────────────────────

export const MOCK_DEX_ID = 'dex-00000000-0000-0000-0000-000000000001'
export const MOCK_FORM_ID = 'form-00000000-0000-0000-0000-000000000001'

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

// ── Handlers ──────────────────────────────────────────────────────────────────

export const handlers = [
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
]
