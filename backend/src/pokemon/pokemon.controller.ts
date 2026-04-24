import { Controller, Get, Param, Query } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { SpeciesQueryDto } from './dto/species-query.dto';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get('types')
  getTypes() {
    return this.pokemonService.getTypes();
  }

  @Get('species')
  findAllSpecies(@Query() query: SpeciesQueryDto) {
    return this.pokemonService.findAllSpecies(query);
  }

  @Get('species/:id')
  findSpeciesById(@Param('id') id: string) {
    return this.pokemonService.findSpeciesById(id);
  }

  @Get('forms/:id')
  findFormById(@Param('id') id: string) {
    return this.pokemonService.findFormById(id);
  }
}
