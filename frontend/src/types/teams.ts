export interface TeamMemberForm {
  id: string
  displayName: string
  type1: string | null
  type2: string | null
  spriteUrl: string | null
  spriteFrontUrl: string | null
  spriteShinyUrl: string | null
  species: { id: string; displayName: string; nationalDexNumber: number }
}

export interface TeamMember {
  id: string
  teamId: string
  slot: number
  formId: string | null
  form: TeamMemberForm | null
  nickname: string | null
  isShiny: boolean
  heldItem: string | null
  ability: string | null
  nature: string | null
  move1: string | null
  move2: string | null
  move3: string | null
  move4: string | null
  evHp: number
  evAtk: number
  evDef: number
  evSpa: number
  evSpd: number
  evSpe: number
  ivHp: number | null
  ivAtk: number | null
  ivDef: number | null
  ivSpa: number | null
  ivSpd: number | null
  ivSpe: number | null
  teraType: string | null
  megaStone: string | null
  zCrystal: string | null
  dynamaxLevel: number | null
}

export interface Team {
  id: string
  userId: string
  name: string
  game: string
  battleFormat: string
  notes: string | null
  members: TeamMember[]
  createdAt: string
  updatedAt: string
}

export interface CreateTeamDto {
  name: string
  game: string
  battleFormat?: string
  notes?: string
}

export interface UpdateTeamDto {
  name?: string
  game?: string
  battleFormat?: string
  notes?: string
}

export interface UpsertTeamMemberDto {
  formId?: string | null
  nickname?: string | null
  isShiny?: boolean
  heldItem?: string | null
  ability?: string | null
  nature?: string | null
  move1?: string | null
  move2?: string | null
  move3?: string | null
  move4?: string | null
  evHp?: number
  evAtk?: number
  evDef?: number
  evSpa?: number
  evSpd?: number
  evSpe?: number
  ivHp?: number | null
  ivAtk?: number | null
  ivDef?: number | null
  ivSpa?: number | null
  ivSpd?: number | null
  ivSpe?: number | null
  teraType?: string | null
  megaStone?: string | null
  zCrystal?: string | null
  dynamaxLevel?: number | null
}
