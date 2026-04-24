import 'reflect-metadata';
import { AppDataSource } from '../src/config/data-source';
import { PokemonSpecies } from '../src/pokemon/entities/pokemon-species.entity';
import { PokemonForm } from '../src/pokemon/entities/pokemon-form.entity';
import { PokemonSyncService } from '../src/pokemon/sync/pokemon-sync.service';
import { PokeApiClient } from '../src/pokemon/sync/pokeapi.client';

async function main() {
  console.log('Initializing database connection...');
  await AppDataSource.initialize();

  const speciesRepo = AppDataSource.getRepository(PokemonSpecies);
  const formRepo = AppDataSource.getRepository(PokemonForm);
  const client = new PokeApiClient();

  // PokemonSyncService needs @InjectRepository but we're outside NestJS context,
  // so we construct it directly.
  const service = new (PokemonSyncService as any)(speciesRepo, formRepo, client) as PokemonSyncService;

  console.log('Starting PokéAPI sync (this will take 8-15 minutes)...');
  const result = await service.syncAll();

  console.log(`\nSync complete!`);
  console.log(`  Species: ${result.speciesCount}`);
  console.log(`  Forms:   ${result.formCount}`);

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
