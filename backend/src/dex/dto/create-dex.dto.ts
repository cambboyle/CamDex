import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const VALID_GAMES = [
  'home',
  'champions',
  'scarlet-violet',
  'sword-shield',
  'brilliant-diamond-shining-pearl',
  'legends-arceus',
  'ultra-sun-ultra-moon',
  'sun-moon',
  'omega-ruby-alpha-sapphire',
  'x-y',
  'black-2-white-2',
  'black-white',
  'heartgold-soulsilver',
  'diamond-pearl-platinum',
  'firered-leafgreen',
  'ruby-sapphire-emerald',
  'gold-silver-crystal',
  'red-blue-yellow',
] as const;

export class CreateDexDto {
  @IsString()
  @MaxLength(60)
  name: string;

  @IsOptional()
  @IsIn(VALID_GAMES)
  game?: string;

  /** Track shiny sprites instead of normal */
  @IsOptional()
  @IsBoolean()
  isShiny?: boolean;

  /** Include alternate/regional/mega forms (not just the default form per species) */
  @IsOptional()
  @IsBoolean()
  includeForms?: boolean;

  /** Also include purely cosmetic variants (Unown letters, Vivillon patterns, etc.) */
  @IsOptional()
  @IsBoolean()
  includeCosmeticForms?: boolean;
}
