import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class SpeciesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  type?: string;

  /** Exact generation filter (Pokédex page) */
  @IsOptional()
  @IsNumberString()
  gen?: string;

  /** Max generation filter — show all Pokémon up to and including this gen (team builder) */
  @IsOptional()
  @IsNumberString()
  maxGen?: string;

  /** When "true", restricts results to Pokémon available in Pokémon Champions */
  @IsOptional()
  @IsString()
  championsOnly?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
