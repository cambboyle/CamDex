import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdatePokemonDto {
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
  @IsString()
  notes?: string;
}
