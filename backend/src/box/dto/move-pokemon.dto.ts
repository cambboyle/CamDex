import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class MovePokemonDto {
  @IsOptional()
  @IsUUID()
  userPokemonId?: string | null;

  @IsInt()
  @Min(0)
  @Max(29)
  slotPosition: number;
}
