import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { SpeciesQueryDto } from './dto/species-query.dto';

const PUBLIC_CACHE = 'public, max-age=86400'; // 24 h — Pokémon data is essentially static

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get('types')
  @Header('Cache-Control', PUBLIC_CACHE)
  getTypes() {
    return this.pokemonService.getTypes();
  }

  @Get('species')
  @Header('Cache-Control', PUBLIC_CACHE)
  findAllSpecies(@Query() query: SpeciesQueryDto) {
    return this.pokemonService.findAllSpecies(query);
  }

  @Get('species/:id')
  @Header('Cache-Control', PUBLIC_CACHE)
  findSpeciesById(@Param('id') id: string) {
    return this.pokemonService.findSpeciesById(id);
  }

  @Get('forms/:id')
  @Header('Cache-Control', PUBLIC_CACHE)
  findFormById(@Param('id') id: string) {
    return this.pokemonService.findFormById(id);
  }
}
