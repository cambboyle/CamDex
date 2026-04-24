export interface UserPokemon {
  id: string
  userId: string
  speciesId: string
  formId: string
  nickname: string | null
  isShiny: boolean
  ball: string | null
  gender: string | null
  gameOfOrigin: string | null
  otName: string | null
  level: number | null
  nature: string | null
  caughtAt: string
  notes: string | null
}

export interface LivingDexEntry {
  formId: string
  formKey: string
  displayName: string
  isDefault: boolean
  isMega: boolean
  isGmax: boolean
  isRegionalVariant: boolean
  regionVariantName: string | null
  type1: string | null
  type2: string | null
  spriteUrl: string | null
  spriteShinyUrl: string | null
  livingDexOrder: number
  nationalDexNumber: number
  speciesDisplayName: string
  caughtId: string | null
  caughtShinyId: string | null
}

export interface LivingDexStats {
  totalForms: number
  caughtForms: number
  shinyCaught: number
  completionPercent: number
}

export interface LivingDexResponse {
  entries: LivingDexEntry[]
  stats: LivingDexStats
}

export interface AddPokemonDto {
  formId: string
  nickname?: string
  isShiny?: boolean
  ball?: string
  gender?: string
  gameOfOrigin?: string
  otName?: string
  level?: number
  nature?: string
  notes?: string
}
