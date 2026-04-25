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
  spriteFrontUrl: string | null
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

export interface Box {
  id: string
  userId: string
  name: string
  position: number
  wallpaper: string | null
  createdAt: string
  updatedAt: string
}

export interface BoxSlot {
  id: string
  boxId: string
  slotPosition: number
  userPokemonId: string | null
  pokemon: BoxPokemon | null
}

export interface BoxPokemon {
  id: string
  nickname: string | null
  isShiny: boolean
  form: {
    id: string
    displayName: string
    spriteUrl: string | null
    spriteFrontUrl: string | null
    spriteShinyUrl: string | null
  }
  species: {
    id: string
    displayName: string
    nationalDexNumber: number
  }
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
