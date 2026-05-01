export interface DexStats {
  total: number
  caught: number
  completionPercent: number
}

export interface DexConfig {
  id: string
  userId: string
  name: string
  game: string
  isShiny: boolean
  includeForms: boolean
  includeCosmeticForms: boolean
  createdAt: string
  updatedAt: string
  stats?: DexStats
}

export interface DexPageEntry {
  formId: string
  displayName: string
  spriteUrl: string | null
  spriteShinyUrl: string | null
  spriteFrontUrl: string | null
  type1: string | null
  type2: string | null
  livingDexOrder: number
  nationalDexNumber: number
  speciesName: string
  caughtAt: string | null
}

/** Inline dex summary embedded in page/all responses */
export interface DexSummary {
  id: string
  name: string
  game: string
  isShiny: boolean
  includeForms: boolean
  includeCosmeticForms: boolean
}

export interface DexPage {
  dex: DexSummary
  entries: DexPageEntry[]
  page: number
  total: number
  totalPages: number
}

export interface DexAll {
  dex: DexSummary
  entries: DexPageEntry[]
  total: number
}

export interface CreateDexDto {
  name: string
  game?: string
  isShiny?: boolean
  includeForms?: boolean
  includeCosmeticForms?: boolean
}

export interface UpdateDexDto {
  name?: string
}
