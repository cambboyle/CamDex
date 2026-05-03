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
