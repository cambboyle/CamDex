export type GameMechanic =
  | 'mega'       // Gen 6, ORAS
  | 'zmove'      // Gen 7
  | 'dynamax'    // Gen 8 (Sword/Shield)
  | 'tera'       // Gen 9 (Scarlet/Violet)
  | 'omni-ring'  // Pokémon Champions (Mega via Omni Ring)
  | null

export interface GameConfig {
  key: string
  label: string
  shortLabel: string
  generation: number | null   // null = Champions (cross-gen)
  mechanic: GameMechanic
  /** true = use SP system (66 total / 32 per stat), false = EVs (508/252) */
  spSystem: boolean
  /** true = IVs are always 31, don't track them */
  fixedIvs: boolean
  /** No two team members may share the same held item */
  itemClause: boolean
  /** Team size for building (always 6 for full teams) */
  teamSize: 6
  /** Query params for the species endpoint */
  speciesFilter: { maxGen?: number; championsOnly?: boolean }
  /**
   * Which regional variant names are obtainable in this game's team builder.
   * null  = no restriction (all regional forms allowed)
   * []    = no regional variants — only default forms
   * [...] = only the listed region names (e.g. ['alola', 'galar'])
   *
   * Possible values: 'alola' | 'galar' | 'hisui' | 'paldea'
   */
  allowedRegions: string[] | null
}

// ── Game definitions ────────────────────────────────────────────────────────

export const GAMES: GameConfig[] = [
  {
    key: 'champions',
    label: 'Pokémon Champions',
    shortLabel: 'Champions',
    generation: null,
    mechanic: 'omni-ring',
    spSystem: true,
    fixedIvs: true,
    itemClause: true,
    teamSize: 6,
    speciesFilter: { championsOnly: true },
    allowedRegions: null, // all regional forms allowed
  },
  {
    key: 'scarlet-violet',
    label: 'Scarlet / Violet',
    shortLabel: 'S/V',
    generation: 9,
    mechanic: 'tera',
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 9 },
    allowedRegions: null, // S/V + HOME: all prior regional forms accessible
  },
  {
    key: 'sword-shield',
    label: 'Sword / Shield',
    shortLabel: 'SwSh',
    generation: 8,
    mechanic: 'dynamax',
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 8 },
    allowedRegions: ['alola', 'galar'], // Galarian native; Alolan obtainable via transfer
  },
  {
    key: 'brilliant-diamond-shining-pearl',
    label: 'Brilliant Diamond / Shining Pearl',
    shortLabel: 'BDSP',
    generation: 8,
    mechanic: null,
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 4 },
    allowedRegions: [], // Gen 1–4 only, no regional variants exist yet
  },
  {
    key: 'legends-arceus',
    label: 'Legends: Arceus',
    shortLabel: 'PLA',
    generation: 8,
    mechanic: null,
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 8 },
    allowedRegions: ['hisui'], // only Hisuian forms are native to Hisui
  },
  {
    key: 'ultra-sun-ultra-moon',
    label: 'Ultra Sun / Ultra Moon',
    shortLabel: 'USUM',
    generation: 7,
    mechanic: 'zmove',
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 7 },
    allowedRegions: ['alola'], // Alolan forms introduced this gen
  },
  {
    key: 'sun-moon',
    label: 'Sun / Moon',
    shortLabel: 'SM',
    generation: 7,
    mechanic: 'zmove',
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 7 },
    allowedRegions: ['alola'],
  },
  {
    key: 'omega-ruby-alpha-sapphire',
    label: 'Omega Ruby / Alpha Sapphire',
    shortLabel: 'ORAS',
    generation: 6,
    mechanic: 'mega',
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 6 },
    allowedRegions: [], // no regional variants before Gen 7
  },
  {
    key: 'x-y',
    label: 'X / Y',
    shortLabel: 'X/Y',
    generation: 6,
    mechanic: 'mega',
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 6 },
    allowedRegions: [],
  },
  {
    key: 'black-2-white-2',
    label: 'Black 2 / White 2',
    shortLabel: 'B2W2',
    generation: 5,
    mechanic: null,
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 5 },
    allowedRegions: [],
  },
  {
    key: 'black-white',
    label: 'Black / White',
    shortLabel: 'BW',
    generation: 5,
    mechanic: null,
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 5 },
    allowedRegions: [],
  },
  {
    key: 'heartgold-soulsilver',
    label: 'HeartGold / SoulSilver',
    shortLabel: 'HGSS',
    generation: 4,
    mechanic: null,
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 4 },
    allowedRegions: [],
  },
  {
    key: 'diamond-pearl-platinum',
    label: 'Diamond / Pearl / Platinum',
    shortLabel: 'DPPt',
    generation: 4,
    mechanic: null,
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 4 },
    allowedRegions: [],
  },
  {
    key: 'firered-leafgreen',
    label: 'FireRed / LeafGreen',
    shortLabel: 'FRLG',
    generation: 3,
    mechanic: null,
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 1 },
    allowedRegions: [],
  },
  {
    key: 'ruby-sapphire-emerald',
    label: 'Ruby / Sapphire / Emerald',
    shortLabel: 'RSE',
    generation: 3,
    mechanic: null,
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 3 },
    allowedRegions: [],
  },
  {
    key: 'gold-silver-crystal',
    label: 'Gold / Silver / Crystal',
    shortLabel: 'GSC',
    generation: 2,
    mechanic: null,
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 2 },
    allowedRegions: [],
  },
  {
    key: 'red-blue-yellow',
    label: 'Red / Blue / Yellow',
    shortLabel: 'RBY',
    generation: 1,
    mechanic: null,
    spSystem: false,
    fixedIvs: false,
    itemClause: false,
    teamSize: 6,
    speciesFilter: { maxGen: 1 },
    allowedRegions: [],
  },
]

export const GAME_MAP: Record<string, GameConfig> = Object.fromEntries(
  GAMES.map((g) => [g.key, g]),
)

export function getGameConfig(key: string): GameConfig {
  return GAME_MAP[key] ?? GAMES[0]
}

export const NATURES = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky',
]

export const EV_STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const
export type EvStat = typeof EV_STATS[number]

export const STAT_LABELS: Record<EvStat, string> = {
  hp: 'HP', atk: 'Atk', def: 'Def', spa: 'Sp.A', spd: 'Sp.D', spe: 'Spe',
}

// ── Dex tracker config ────────────────────────────────────────────────────────

export interface DexTypeConfig {
  key: string
  label: string
  description: string
  /** Whether to track shiny sprites */
  isShiny: boolean
  /** Whether to show only one entry per species (default form) */
  speciesOnly: boolean
}

export const DEX_TYPES: DexTypeConfig[] = [
  {
    key: 'species',
    label: 'Living Dex',
    description: 'One of every species — catch the default form of each Pokémon',
    isShiny: false,
    speciesOnly: true,
  },
  {
    key: 'living-form',
    label: 'Living Form Dex',
    description: 'Every obtainable form of every Pokémon — the completionist challenge',
    isShiny: false,
    speciesOnly: false,
  },
  {
    key: 'shiny-species',
    label: 'Shiny Dex',
    description: 'One shiny of every species — one shiny hunt per Pokémon',
    isShiny: true,
    speciesOnly: true,
  },
  {
    key: 'shiny-form',
    label: 'Shiny Form Dex',
    description: 'Every shiny form of every Pokémon — the ultimate shiny challenge',
    isShiny: true,
    speciesOnly: false,
  },
]

export const DEX_TYPE_MAP: Record<string, DexTypeConfig> = Object.fromEntries(
  DEX_TYPES.map((d) => [d.key, d]),
)

/** "HOME" pseudo-game config used on the dex tracker list */
export const HOME_GAME: GameConfig = {
  key: 'home',
  label: 'Pokémon HOME (National)',
  shortLabel: 'HOME',
  generation: null,
  mechanic: null,
  spSystem: false,
  fixedIvs: false,
  itemClause: false,
  teamSize: 6,
  speciesFilter: {},
  allowedRegions: null,
}

/** All games including HOME for dex tracker dropdowns */
export const DEX_GAMES: GameConfig[] = [HOME_GAME, ...GAMES]
