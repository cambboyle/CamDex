import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PokemonSpecies } from './entities/pokemon-species.entity';
import { PokemonForm } from './entities/pokemon-form.entity';
import { SpeciesQueryDto } from './dto/species-query.dto';

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
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));
    const gen = query.gen ? parseInt(query.gen, 10) : undefined;
    const maxGen = query.maxGen ? parseInt(query.maxGen, 10) : undefined;
    const championsOnly = query.championsOnly === 'true';

    const qb = this.speciesRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.forms', 'f')
      .orderBy('s.nationalDexNumber', 'ASC')
      .addOrderBy('f.livingDexOrder', 'ASC');

    if (query.search) {
      qb.andWhere('s.display_name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    if (query.type) {
      qb.andWhere('(f.type1 = :type OR f.type2 = :type)', { type: query.type });
    }

    if (gen) {
      // Exact generation (Pokédex filter)
      qb.andWhere('s.generation = :gen', { gen });
    } else if (maxGen) {
      // Up-to generation (team builder filter)
      qb.andWhere('s.generation <= :maxGen', { maxGen });
    }

    if (championsOnly) {
      // Champions launch pool: Paldean regional dex range + known additions
      // National dex #001–375 and #388–392 cover the Paldean-adjacent roster
      qb.andWhere(
        '(s.national_dex_number <= 375 OR (s.national_dex_number >= 388 AND s.national_dex_number <= 392))',
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
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
