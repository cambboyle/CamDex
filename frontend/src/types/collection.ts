import type { PokemonForm, PokemonSpeciesSummary } from './pokemon'

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
  form?: PokemonForm
  species?: PokemonSpeciesSummary
}

export interface LivingDexEntry {
  form: PokemonForm
  species: PokemonSpeciesSummary
  caught: UserPokemon | null
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
  wallpaper: string
  slotCount: number
}

export interface BoxSlot {
  id: string
  boxId: string
  slotPosition: number
  userPokemonId: string | null
  userPokemon: UserPokemon | null
}

export interface CreateUserPokemonDto {
  speciesId: string
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
