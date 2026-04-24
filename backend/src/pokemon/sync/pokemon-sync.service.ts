import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PokemonSpecies } from '../entities/pokemon-species.entity';
import { PokemonForm } from '../entities/pokemon-form.entity';
import { PokeApiClient } from './pokeapi.client';

const EXCLUDED_FORMS = new Set([
  'minior-red-meteor',
  'minior-blue-meteor',
  'minior-green-meteor',
  'minior-yellow-meteor',
  'minior-orange-meteor',
  'minior-violet-meteor',
  'wishiwashi-school',
  'darmanitan-zen',
  'darmanitan-galar-zen',
  'morpeko-hangry',
  'mimikyu-busted',
  'eiscue-noice',
  'zacian-crowned',
  'zamazenta-crowned',
]);

function getGenNumber(genName: string): number {
  const map: Record<string, number> = {
    'generation-i': 1, 'generation-ii': 2, 'generation-iii': 3,
    'generation-iv': 4, 'generation-v': 5, 'generation-vi': 6,
    'generation-vii': 7, 'generation-viii': 8, 'generation-ix': 9,
  };
  return map[genName] ?? 1;
}

function getFormPriority(name: string, isDefault: boolean): number {
  if (isDefault) return 0;
  if (name.includes('-alola') || name.includes('-galar') || name.includes('-hisui') || name.includes('-paldea')) return 100;
  if (name.includes('-mega')) return 200;
  if (name.includes('-gmax')) return 300;
  return 400;
}

function getFormKey(speciesName: string, pokemonName: string, isDefault: boolean): string {
  if (isDefault) return '';
  const prefix = speciesName + '-';
  return pokemonName.startsWith(prefix) ? pokemonName.slice(prefix.length) : pokemonName;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class PokemonSyncService {
  private readonly logger = new Logger(PokemonSyncService.name);

  constructor(
    @InjectRepository(PokemonSpecies)
    private readonly speciesRepo: Repository<PokemonSpecies>,
    @InjectRepository(PokemonForm)
    private readonly formRepo: Repository<PokemonForm>,
    private readonly pokeApi: PokeApiClient,
  ) {}

  async syncAll(): Promise<{ speciesCount: number; formCount: number }> {
    const list = await this.pokeApi.getSpeciesList(2000);
    const speciesNames = list.results.map((r) => r.name);
    this.logger.log(`Found ${speciesNames.length} species to sync`);

    let speciesCount = 0;
    let formCount = 0;
    const BATCH_SIZE = 20;

    for (let i = 0; i < speciesNames.length; i += BATCH_SIZE) {
      const batch = speciesNames.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((name) => this.syncSpecies(name)),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          speciesCount += 1;
          formCount += result.value;
        } else {
          this.logger.warn(`Species sync failed: ${String(result.reason)}`);
        }
      }

      if (i % 100 === 0) {
        this.logger.log(`Progress: ${i}/${speciesNames.length} species processed`);
      }

      if (i + BATCH_SIZE < speciesNames.length) {
        await sleep(500);
      }
    }

    this.logger.log(`Sync complete: ${speciesCount} species, ${formCount} forms`);
    return { speciesCount, formCount };
  }

  private async syncSpecies(name: string): Promise<number> {
    const speciesData = await this.pokeApi.getSpecies(name);
    const dexNumber = speciesData.id;
    const genNumber = getGenNumber(speciesData.generation.name);
    const flavorText =
      speciesData.flavor_text_entries.find((e) => e.language.name === 'en')
        ?.flavor_text.replace(/\f/g, ' ')
        .replace(/\n/g, ' ') ?? null;

    // Upsert species
    await this.speciesRepo
      .createQueryBuilder()
      .insert()
      .into(PokemonSpecies)
      .values({
        nationalDexNumber: dexNumber,
        name: speciesData.name,
        displayName: this.toDisplayName(speciesData.name),
        generation: genNumber,
        isLegendary: speciesData.is_legendary,
        isMythical: speciesData.is_mythical,
        isBaby: speciesData.is_baby,
        color: speciesData.color?.name ?? null,
        shape: speciesData.shape?.name ?? null,
        flavorText,
        syncedAt: new Date(),
      })
      .orUpdate(
        ['name', 'display_name', 'generation', 'is_legendary', 'is_mythical',
          'is_baby', 'color', 'shape', 'flavor_text', 'synced_at'],
        ['national_dex_number'],
      )
      .execute();

    const species = await this.speciesRepo.findOneByOrFail({ nationalDexNumber: dexNumber });

    let formCount = 0;
    for (const variety of speciesData.varieties) {
      const pokemonName = variety.pokemon.name;
      if (EXCLUDED_FORMS.has(pokemonName)) continue;

      try {
        const pokemonData = await this.pokeApi.getPokemon(pokemonName);

        // Fetch form data for is_battle_only
        let isBattleOnly = false;
        try {
          const formData = await this.pokeApi.getPokemonForm(pokemonName);
          isBattleOnly = formData.is_battle_only;
        } catch {
          // If form fetch fails, assume not battle-only
        }

        if (isBattleOnly) continue;

        const isDefault = variety.is_default;
        const formKey = getFormKey(speciesData.name, pokemonName, isDefault);
        const formPriority = getFormPriority(pokemonName, isDefault);
        const livingDexOrder = dexNumber * 1000 + formPriority;

        const isMega = pokemonName.includes('-mega');
        const isGmax = pokemonName.includes('-gmax');
        const isRegionalVariant =
          pokemonName.includes('-alola') ||
          pokemonName.includes('-galar') ||
          pokemonName.includes('-hisui') ||
          pokemonName.includes('-paldea');

        let regionVariantName: string | null = null;
        if (pokemonName.includes('-alola')) regionVariantName = 'alola';
        else if (pokemonName.includes('-galar')) regionVariantName = 'galar';
        else if (pokemonName.includes('-hisui')) regionVariantName = 'hisui';
        else if (pokemonName.includes('-paldea')) regionVariantName = 'paldea';

        const sprites = pokemonData.sprites;
        const spriteUrl = sprites.other?.['official-artwork']?.front_default ?? null;
        const spriteShinyUrl = sprites.other?.['official-artwork']?.front_shiny ?? null;
        const spriteFrontUrl = sprites.front_default ?? null;

        const statMap: Record<string, number | null> = {
          hp: null, atk: null, def: null, spa: null, spd: null, spe: null,
        };
        const statKeyMap: Record<string, string> = {
          hp: 'hp', attack: 'atk', defense: 'def',
          'special-attack': 'spa', 'special-defense': 'spd', speed: 'spe',
        };
        for (const stat of pokemonData.stats) {
          const key = statKeyMap[stat.stat.name];
          if (key) statMap[key] = stat.base_stat;
        }

        const type1 = pokemonData.types.find((t) => t.slot === 1)?.type.name ?? null;
        const type2 = pokemonData.types.find((t) => t.slot === 2)?.type.name ?? null;

        const displayName = isDefault
          ? this.toDisplayName(speciesData.name)
          : this.toDisplayName(pokemonName);

        await this.formRepo
          .createQueryBuilder()
          .insert()
          .into(PokemonForm)
          .values({
            species: { id: species.id },
            formKey,
            displayName,
            isDefault,
            isBattleOnly: false,
            isMega,
            isGmax,
            isRegionalVariant,
            regionVariantName,
            type1,
            type2,
            hp: statMap.hp,
            atk: statMap.atk,
            def: statMap.def,
            spa: statMap.spa,
            spd: statMap.spd,
            spe: statMap.spe,
            spriteUrl,
            spriteShinyUrl,
            spriteFrontUrl,
            livingDexOrder,
          })
          .orUpdate(
            ['display_name', 'is_default', 'is_battle_only', 'is_mega', 'is_gmax',
              'is_regional_variant', 'region_variant_name', 'type1', 'type2',
              'hp', 'atk', 'def', 'spa', 'spd', 'spe',
              'sprite_url', 'sprite_shiny_url', 'sprite_front_url', 'living_dex_order'],
            ['species_id', 'form_key'],
          )
          .execute();

        formCount++;
      } catch (err) {
        this.logger.warn(`Skipping form ${pokemonName}: ${String(err)}`);
      }
    }

    return formCount;
  }

  private toDisplayName(slug: string): string {
    return slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}
