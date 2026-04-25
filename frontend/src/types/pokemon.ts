export interface PokemonSpecies {
  id: string
  nationalDexNumber: number
  name: string
  displayName: string
  generation: number
  isLegendary: boolean
  isMythical: boolean
  isBaby: boolean
  color: string | null
  shape: string | null
  flavorText: string | null
  flavorTexts: { text: string; version: string }[] | null
  forms: PokemonForm[]
}

export interface PokemonForm {
  id: string
  formKey: string
  displayName: string
  isDefault: boolean
  isBattleOnly: boolean
  isMega: boolean
  isGmax: boolean
  isRegionalVariant: boolean
  regionVariantName: string | null
  type1: string | null
  type2: string | null
  hp: number | null
  atk: number | null
  def: number | null
  spa: number | null
  spd: number | null
  spe: number | null
  spriteUrl: string | null
  spriteShinyUrl: string | null
  spriteFrontUrl: string | null
  livingDexOrder: number
}

export interface PaginatedSpecies {
  data: PokemonSpecies[]
  total: number
  page: number
  limit: number
}
