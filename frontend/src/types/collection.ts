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

