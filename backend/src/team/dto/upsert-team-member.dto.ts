import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const TYPES = [
  'bug',
  'dark',
  'dragon',
  'electric',
  'fairy',
  'fighting',
  'fire',
  'flying',
  'ghost',
  'grass',
  'ground',
  'ice',
  'normal',
  'poison',
  'psychic',
  'rock',
  'steel',
  'water',
  'stellar',
] as const;

export class UpsertTeamMemberDto {
  @IsOptional()
  @IsUUID()
  formId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  nickname?: string | null;

  @IsOptional()
  @IsBoolean()
  isShiny?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  heldItem?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ability?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  nature?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  move1?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  move2?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  move3?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  move4?: string | null;

  // EVs / SP — validated at service level based on team's game
  @IsOptional() @IsInt() @Min(0) @Max(252) evHp?: number;
  @IsOptional() @IsInt() @Min(0) @Max(252) evAtk?: number;
  @IsOptional() @IsInt() @Min(0) @Max(252) evDef?: number;
  @IsOptional() @IsInt() @Min(0) @Max(252) evSpa?: number;
  @IsOptional() @IsInt() @Min(0) @Max(252) evSpd?: number;
  @IsOptional() @IsInt() @Min(0) @Max(252) evSpe?: number;

  // IVs
  @IsOptional() @IsInt() @Min(0) @Max(31) ivHp?: number | null;
  @IsOptional() @IsInt() @Min(0) @Max(31) ivAtk?: number | null;
  @IsOptional() @IsInt() @Min(0) @Max(31) ivDef?: number | null;
  @IsOptional() @IsInt() @Min(0) @Max(31) ivSpa?: number | null;
  @IsOptional() @IsInt() @Min(0) @Max(31) ivSpd?: number | null;
  @IsOptional() @IsInt() @Min(0) @Max(31) ivSpe?: number | null;

  // Game-mechanic slots
  @IsOptional()
  @IsIn(TYPES)
  teraType?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  megaStone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  zCrystal?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  dynamaxLevel?: number | null;
}
