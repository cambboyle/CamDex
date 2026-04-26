import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const VALID_GAMES = [
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

const VALID_FORMATS = ['singles', 'doubles', 'casual'] as const;

export class CreateTeamDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsIn(VALID_GAMES)
  game: string;

  @IsOptional()
  @IsIn(VALID_FORMATS)
  battleFormat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
