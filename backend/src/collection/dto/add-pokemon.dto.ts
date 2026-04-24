import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

const NATURES = [
  'hardy','lonely','brave','adamant','naughty','bold','docile','relaxed',
  'impish','lax','timid','hasty','serious','jolly','naive','modest',
  'mild','quiet','bashful','rash','calm','gentle','sassy','careful','quirky',
];

export class AddPokemonDto {
  @IsUUID()
  formId: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  nickname?: string;

  @IsOptional()
  @IsBoolean()
  isShiny?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  ball?: string;

  @IsOptional()
  @IsIn(['m', 'f', 'u'])
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gameOfOrigin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  otName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  level?: number;

  @IsOptional()
  @IsIn(NATURES)
  nature?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
