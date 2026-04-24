export interface PokemonSpeciesSummary {
  id: string
  nationalDexNumber: number
  name: string
  displayName: string
  generation: number
  isLegendary: boolean
  isMythical: boolean
  isBaby: boolean
  color: string | null
}

export interface PokemonSpeciesDetail extends PokemonSpeciesSummary {
  flavorText: string | null
  evolvesFromId: string | null
  forms: PokemonForm[]
}

export interface PokemonForm {
  id: string
  speciesId: string
  formKey: string
  displayName: string
  isDefault: boolean
  isBattleOnly: boolean
  isMega: boolean
  isGmax: boolean
  isRegionalVariant: boolean
  regionVariantName: string | null
  type1: string
  type2: string | null
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
  spriteUrl: string | null
  spriteShinyUrl: string | null
  spriteFrontUrl: string | null
  livingDexOrder: number
}

export interface PaginatedSpecies {
  data: PokemonSpeciesSummary[]
  total: number
  page: number
  limit: number
}
