import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

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

const VALID_DEX_TYPES = [
  'living-form',
  'species',
  'shiny-form',
  'shiny-species',
] as const;

export class CreateDexDto {
  @IsString()
  @MaxLength(60)
  name: string;

  @IsOptional()
  @IsIn(VALID_GAMES)
  game?: string;

  @IsOptional()
  @IsIn(VALID_DEX_TYPES)
  dexType?: string;
}
