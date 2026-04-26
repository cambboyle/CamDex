import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { SpeciesQueryDto } from './dto/species-query.dto';

/** Static resource cache — use only for endpoints with no query-param filters */
const STATIC_CACHE = 'public, max-age=86400'; // 24 h
/** Short private cache for filtered list endpoints — avoids stale-filter bugs */
const LIST_CACHE = 'private, no-cache';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get('types')
  @Header('Cache-Control', STATIC_CACHE)
  getTypes() {
    return this.pokemonService.getTypes();
  }

  @Get('species')
  @Header('Cache-Control', LIST_CACHE)
  findAllSpecies(@Query() query: SpeciesQueryDto) {
    return this.pokemonService.findAllSpecies(query);
  }

  @Get('species/:id')
  @Header('Cache-Control', STATIC_CACHE)
  findSpeciesById(@Param('id') id: string) {
    return this.pokemonService.findSpeciesById(id);
  }

  @Get('forms/:id')
  @Header('Cache-Control', STATIC_CACHE)
  findFormById(@Param('id') id: string) {
    return this.pokemonService.findFormById(id);
  }
}
