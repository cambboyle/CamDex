import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonSpecies } from './entities/pokemon-species.entity';
import { PokemonForm } from './entities/pokemon-form.entity';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { PokemonSyncService } from './sync/pokemon-sync.service';
import { PokeApiClient } from './sync/pokeapi.client';

@Module({
  imports: [TypeOrmModule.forFeature([PokemonSpecies, PokemonForm])],
  providers: [PokemonService, PokemonSyncService, PokeApiClient],
  controllers: [PokemonController],
  exports: [PokemonService],
})
export class PokemonModule {}
