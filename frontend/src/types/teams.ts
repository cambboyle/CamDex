import type { UserPokemon } from './collection'

export interface Team {
  id: string
  userId: string
  name: string
  format: string
  notes: string | null
  createdAt: string
  updatedAt: string
  members?: TeamMember[]
}

export interface TeamMember {
  id: string
  teamId: string
  slot: number
  userPokemonId: string | null
  heldItem: string | null
  move1: string | null
  move2: string | null
  move3: string | null
  move4: string | null
  teraType: string | null
  evHp: number
  evAttack: number
  evDefense: number
  evSpAtk: number
  evSpDef: number
  evSpeed: number
  userPokemon: UserPokemon | null
}

export interface UpsertTeamMemberDto {
  userPokemonId?: string | null
  heldItem?: string | null
  move1?: string | null
  move2?: string | null
  move3?: string | null
  move4?: string | null
  teraType?: string | null
  evHp?: number
  evAttack?: number
  evDefense?: number
  evSpAtk?: number
  evSpDef?: number
  evSpeed?: number
}
