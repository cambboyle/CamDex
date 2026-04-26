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
  dexType: string
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

export interface DexPage {
  dex: { id: string; name: string; game: string; dexType: string }
  entries: DexPageEntry[]
  page: number
  total: number
  totalPages: number
}

export interface DexAll {
  dex: { id: string; name: string; game: string; dexType: string }
  entries: DexPageEntry[]
  total: number
}

export interface CreateDexDto {
  name: string
  game?: string
  dexType?: string
}

export interface UpdateDexDto {
  name?: string
}
