import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PokemonSpecies } from './entities/pokemon-species.entity';
import { PokemonForm } from './entities/pokemon-form.entity';
import { SpeciesQueryDto } from './dto/species-query.dto';
import { CHAMPIONS_DEX_NUMBERS } from '../dex/dex.service';

const TYPES = [
  'bug',
  'dark',
  'dragon',
  'electric',
  'fairy',
  'fighting',
  'fire',
  'flying',
  'ghost',
  'grass',
  'ground',
  'ice',
  'normal',
  'poison',
  'psychic',
  'rock',
  'steel',
  'water',
];

@Injectable()
export class PokemonService {
  constructor(
    @InjectRepository(PokemonSpecies)
    private readonly speciesRepo: Repository<PokemonSpecies>,
    @InjectRepository(PokemonForm)
    private readonly formRepo: Repository<PokemonForm>,
  ) {}

  async findAllSpecies(query: SpeciesQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(1500, Math.max(1, parseInt(query.limit ?? '20', 10)));
    const gen = query.gen ? parseInt(query.gen, 10) : undefined;
    const maxGen = query.maxGen ? parseInt(query.maxGen, 10) : undefined;
    const championsOnly = query.championsOnly === 'true';

    // ── Step 1: paginate species only (no form join) ──────────────────────
    // Using leftJoinAndSelect + take/skip causes TypeORM to limit on *rows*
    // rather than *entities*, so species with many forms (Unown: 28) eat the
    // row budget and fewer species than expected are returned.  Paginating the
    // species query alone gives the correct count and IDs; forms are loaded
    // separately below.
    const speciesQb = this.speciesRepo
      .createQueryBuilder('s')
      .orderBy('s.nationalDexNumber', 'ASC');

    if (query.search) {
      speciesQb.andWhere('s.display_name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    // Type filter: keep only species that have at least one form of that type
    if (query.type) {
      speciesQb.andWhere(
        `s.id IN (SELECT f.species_id FROM pokemon_forms f WHERE f.type1 = :type OR f.type2 = :type)`,
        { type: query.type },
      );
    }

    if (gen) {
      speciesQb.andWhere('s.generation = :gen', { gen });
    } else if (maxGen) {
      speciesQb.andWhere('s.generation <= :maxGen', { maxGen });
    }

    if (championsOnly) {
      speciesQb.andWhere(`s.national_dex_number IN (:...championsNums)`, {
        championsNums: [...CHAMPIONS_DEX_NUMBERS],
      });
    }

    const [species, total] = await speciesQb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // ── Step 2: load forms for the paginated species ──────────────────────
    if (species.length > 0) {
      const ids = species.map((s) => s.id);

      // getRawAndEntities gives us both the typed entity AND the raw SQL row.
      // TypeORM aliases each selected column as "<alias>_<column>", so the
      // species FK is available as raw.f_species_id without needing an
      // explicit @Column declaration on the entity.
      const { entities: forms, raw } = await this.formRepo
        .createQueryBuilder('f')
        .where('f.species_id IN (:...ids)', { ids })
        .orderBy('f.living_dex_order', 'ASC')
        .getRawAndEntities();

      const bySpecies = new Map<string, PokemonForm[]>();
      for (let i = 0; i < forms.length; i++) {
        const sid = raw[i].f_species_id as string;
        if (!bySpecies.has(sid)) bySpecies.set(sid, []);
        bySpecies.get(sid)!.push(forms[i]);
      }

      for (const s of species) {
        s.forms = bySpecies.get(s.id) ?? [];
      }
    }

    return { data: species, total, page, limit };
  }

  async findSpeciesById(id: string): Promise<PokemonSpecies> {
    const species = await this.speciesRepo.findOne({
      where: { id },
      relations: ['forms'],
      order: { forms: { livingDexOrder: 'ASC' } },
    });
    if (!species) throw new NotFoundException(`Species ${id} not found`);
    return species;
  }

  async findFormById(id: string): Promise<PokemonForm> {
    const form = await this.formRepo.findOne({
      where: { id },
      relations: ['species'],
    });
    if (!form) throw new NotFoundException(`Form ${id} not found`);
    return form;
  }

  getTypes(): string[] {
    return TYPES;
  }
}
