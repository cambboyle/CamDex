import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Dex } from './entities/dex.entity';
import { DexEntry } from './entities/dex-entry.entity';
import { CreateDexDto } from './dto/create-dex.dto';
import { UpdateDexDto } from './dto/update-dex.dto';

const BOX_SIZE = 30;

/**
 * Official Pokémon Champions launch roster (Regulation M-A) — 186 species.
 * Source: https://www.serebii.net/pokemonchampions/pokemon.shtml
 * Regional forms of these species (Alolan Ninetales, Hisuian Typhlosion, etc.)
 * are included via the form-level allowedRegions: null setting on the frontend.
 */
export const CHAMPIONS_DEX_NUMBERS: readonly number[] = [
  // Gen I
  3, 6, 9, 15, 18, 24, 25, 26, 36, 38, 59, 65, 68, 71, 80, 94, 115, 121, 127,
  128, 130, 132, 134, 135, 136, 142, 143, 149,
  // Gen II
  154, 157, 160, 168, 181, 184, 186, 196, 197, 199, 205, 208, 212, 214, 227,
  229, 248,
  // Gen III
  279, 282, 302, 306, 308, 310, 319, 323, 324, 334, 350, 351, 354, 358, 359,
  362,
  // Gen IV
  389, 392, 395, 405, 407, 409, 411, 428, 442, 445, 448, 450, 454, 460, 461,
  464, 470, 471, 472, 473, 475, 478, 479,
  // Gen V
  497, 500, 503, 505, 510, 512, 514, 516, 530, 531, 534, 547, 553, 563, 569,
  571, 579, 584, 587, 609, 614, 618, 623, 635, 637,
  // Gen VI
  652, 655, 658, 660, 663, 666, 670, 671, 675, 676, 678, 681, 683, 685, 693,
  695, 697, 699, 700, 701, 702, 706, 707, 709, 711, 713, 715,
  // Gen VII
  724, 727, 730, 733, 740, 745, 748, 750, 752, 758, 763, 765, 766, 778, 780,
  784,
  // Gen VIII
  823, 841, 842, 844, 855, 858, 866, 867, 869, 877, 887,
  // Gen IX
  899, 900, 902, 903, 908, 911, 914, 925, 934, 936, 937, 939, 952, 956, 959,
  964, 968, 970, 981, 983, 1013, 1018, 1019,
] as const;

const CHAMPIONS_IN = CHAMPIONS_DEX_NUMBERS.join(',');

/** Maps a game key to its Pokémon filter — mirrors the frontend gameConfig */
const GAME_FILTERS: Record<
  string,
  { maxGen?: number; championsOnly?: boolean }
> = {
  home: {},
  champions: { championsOnly: true },
  'scarlet-violet': { maxGen: 9 },
  'sword-shield': { maxGen: 8 },
  'brilliant-diamond-shining-pearl': { maxGen: 4 },
  'legends-arceus': { maxGen: 8 },
  'ultra-sun-ultra-moon': { maxGen: 7 },
  'sun-moon': { maxGen: 7 },
  'omega-ruby-alpha-sapphire': { maxGen: 6 },
  'x-y': { maxGen: 6 },
  'black-2-white-2': { maxGen: 5 },
  'black-white': { maxGen: 5 },
  'heartgold-soulsilver': { maxGen: 4 },
  'diamond-pearl-platinum': { maxGen: 4 },
  'firered-leafgreen': { maxGen: 3 },
  'ruby-sapphire-emerald': { maxGen: 3 },
  'gold-silver-crystal': { maxGen: 2 },
  'red-blue-yellow': { maxGen: 1 },
};

export interface DexPageRow {
  formId: string;
  displayName: string;
  spriteUrl: string | null;
  spriteShinyUrl: string | null;
  spriteFrontUrl: string | null;
  type1: string | null;
  type2: string | null;
  livingDexOrder: number;
  nationalDexNumber: number;
  speciesName: string;
  caughtAt: string | null;
}

/** Inline dex summary returned alongside page/all data */
export interface DexSummary {
  id: string;
  name: string;
  game: string;
  isShiny: boolean;
  includeForms: boolean;
  includeCosmeticForms: boolean;
}

function dexSummary(dex: Dex): DexSummary {
  return {
    id: dex.id,
    name: dex.name,
    game: dex.game,
    isShiny: dex.isShiny,
    includeForms: dex.includeForms,
    includeCosmeticForms: dex.includeCosmeticForms,
  };
}

/**
 * Build the form-inclusion conditions based on dex options.
 *
 * - species-only (includeForms=false):         f.is_default = TRUE
 * - forms but no cosmetics (includeForms=true, includeCosmeticForms=false):
 *     show default OR any non-cosmetic alternate form
 * - all forms incl. cosmetics (includeForms=true, includeCosmeticForms=true):
 *     no extra condition beyond is_battle_only = FALSE
 */
export function buildFormConditions(dex: Dex): string[] {
  const conds: string[] = ['f.is_battle_only = FALSE'];
  if (!dex.includeForms) {
    conds.push('f.is_default = TRUE');
  } else if (!dex.includeCosmeticForms) {
    conds.push('(f.is_default = TRUE OR f.is_cosmetic_only = FALSE)');
  }
  return conds;
}

@Injectable()
export class DexService {
  constructor(
    @InjectRepository(Dex)
    private readonly dexRepo: Repository<Dex>,
    @InjectRepository(DexEntry)
    private readonly entryRepo: Repository<DexEntry>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ── Dex CRUD ──────────────────────────────────────────────────────────────

  async findAll(userId: string) {
    const dexes = await this.dexRepo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    // Attach completion stats in parallel — skip assertOwner since we already
    // own these dexes (they came from the userId WHERE clause above).
    return Promise.all(
      dexes.map(async (d) => {
        const stats = await this.computeStats(d);
        return { ...d, stats };
      }),
    );
  }

  async create(userId: string, dto: CreateDexDto): Promise<Dex> {
    const dex = this.dexRepo.create({
      userId,
      name: dto.name,
      game: dto.game ?? 'home',
      isShiny: dto.isShiny ?? false,
      includeForms: dto.includeForms ?? false,
      includeCosmeticForms: dto.includeCosmeticForms ?? false,
    });
    return this.dexRepo.save(dex);
  }

  async update(userId: string, dexId: string, dto: UpdateDexDto): Promise<Dex> {
    const dex = await this.assertOwner(userId, dexId);
    if (dto.name !== undefined) dex.name = dto.name;
    return this.dexRepo.save(dex);
  }

  async remove(userId: string, dexId: string): Promise<void> {
    const dex = await this.assertOwner(userId, dexId);
    await this.dexRepo.remove(dex);
  }

  // ── Pages ─────────────────────────────────────────────────────────────────

  async getPage(userId: string, dexId: string, page: number) {
    const dex = await this.assertOwner(userId, dexId);

    const p = Math.max(1, page);
    const offset = (p - 1) * BOX_SIZE;
    const filter = GAME_FILTERS[dex.game] ?? {};

    const baseConditions = buildFormConditions(dex);
    const champCondition = `s.national_dex_number IN (${CHAMPIONS_IN})`;

    // ── Count query (no dexId param) ──────────────────────────────────────
    const countConditions = [...baseConditions];
    const countParams: unknown[] = [];
    if (filter.championsOnly) {
      countConditions.push(champCondition);
    } else if (filter.maxGen) {
      countParams.push(filter.maxGen);
      countConditions.push(`s.generation <= $${countParams.length}`);
    }
    const countWhere = countConditions.join(' AND ');

    // ── Data query ($1 = dexId, then game param, then limit/offset) ───────
    const dataConditions = [...baseConditions];
    const dataParams: unknown[] = [dexId];
    if (filter.championsOnly) {
      dataConditions.push(champCondition);
    } else if (filter.maxGen) {
      dataParams.push(filter.maxGen);
      dataConditions.push(`s.generation <= $${dataParams.length}`);
    }
    dataParams.push(BOX_SIZE, offset);
    const limitIdx = dataParams.length - 1;
    const offsetIdx = dataParams.length;
    const dataWhere = dataConditions.join(' AND ');

    const [countRows, rows] = await Promise.all([
      this.dataSource.query<{ count: string }[]>(
        `SELECT COUNT(*) AS count
         FROM pokemon_forms f
         JOIN pokemon_species s ON s.id = f.species_id
         WHERE ${countWhere}`,
        countParams,
      ),
      this.dataSource.query<DexPageRow[]>(
        `SELECT
           f.id               AS "formId",
           f.display_name     AS "displayName",
           f.sprite_url       AS "spriteUrl",
           f.sprite_shiny_url AS "spriteShinyUrl",
           f.sprite_front_url AS "spriteFrontUrl",
           f.type1,
           f.type2,
           f.living_dex_order AS "livingDexOrder",
           s.national_dex_number AS "nationalDexNumber",
           s.display_name    AS "speciesName",
           de.caught_at      AS "caughtAt"
         FROM pokemon_forms f
         JOIN pokemon_species s ON s.id = f.species_id
         LEFT JOIN dex_entries de
           ON de.form_id = f.id AND de.dex_id = $1
         WHERE ${dataWhere}
         ORDER BY f.living_dex_order ASC
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        dataParams,
      ),
    ]);

    const total = parseInt(countRows[0]?.count ?? '0', 10);

    return {
      dex: dexSummary(dex),
      entries: rows,
      page: p,
      total,
      totalPages: Math.ceil(total / BOX_SIZE),
    };
  }

  async getAll(userId: string, dexId: string) {
    const dex = await this.assertOwner(userId, dexId);

    const filter = GAME_FILTERS[dex.game] ?? {};
    const baseConditions = buildFormConditions(dex);
    const champCondition = `s.national_dex_number IN (${CHAMPIONS_IN})`;

    const conditions = [...baseConditions];
    const params: unknown[] = [dexId];

    if (filter.championsOnly) {
      conditions.push(champCondition);
    } else if (filter.maxGen) {
      params.push(filter.maxGen);
      conditions.push(`s.generation <= $${params.length}`);
    }

    const where = conditions.join(' AND ');

    const rows = await this.dataSource.query<DexPageRow[]>(
      `SELECT
         f.id               AS "formId",
         f.display_name     AS "displayName",
         f.sprite_url       AS "spriteUrl",
         f.sprite_shiny_url AS "spriteShinyUrl",
         f.sprite_front_url AS "spriteFrontUrl",
         f.type1,
         f.type2,
         f.living_dex_order AS "livingDexOrder",
         s.national_dex_number AS "nationalDexNumber",
         s.display_name    AS "speciesName",
         de.caught_at      AS "caughtAt"
       FROM pokemon_forms f
       JOIN pokemon_species s ON s.id = f.species_id
       LEFT JOIN dex_entries de
         ON de.form_id = f.id AND de.dex_id = $1
       WHERE ${where}
       ORDER BY f.living_dex_order ASC`,
      params,
    );

    return {
      dex: dexSummary(dex),
      entries: rows,
      total: rows.length,
    };
  }

  async getStats(userId: string, dexId: string) {
    const dex = await this.assertOwner(userId, dexId);
    return this.computeStats(dex);
  }

  /** Compute stats without re-querying the dex table (caller already has the entity). */
  private async computeStats(dex: Dex) {
    const filter = GAME_FILTERS[dex.game] ?? {};
    const conditions = buildFormConditions(dex);
    const params: unknown[] = [];
    let idx = 1;

    if (filter.championsOnly) {
      conditions.push(`s.national_dex_number IN (${CHAMPIONS_IN})`);
    } else if (filter.maxGen) {
      params.push(filter.maxGen);
      conditions.push(`s.generation <= $${idx++}`);
    }

    const where = conditions.join(' AND ');
    params.push(dex.id);
    const dexIdParam = idx;

    const rows = await this.dataSource.query<
      { total: string; caught: string }[]
    >(
      `SELECT
         COUNT(*) AS total,
         COUNT(de.id) AS caught
       FROM pokemon_forms f
       JOIN pokemon_species s ON s.id = f.species_id
       LEFT JOIN dex_entries de ON de.form_id = f.id AND de.dex_id = $${dexIdParam}
       WHERE ${where}`,
      params,
    );

    const total = parseInt(rows[0]?.total ?? '0', 10);
    const caught = parseInt(rows[0]?.caught ?? '0', 10);

    return {
      total,
      caught,
      completionPercent: total > 0 ? Math.round((caught / total) * 100) : 0,
    };
  }

  // ── Entry toggle ──────────────────────────────────────────────────────────

  async markCaught(
    userId: string,
    dexId: string,
    formId: string,
  ): Promise<void> {
    await this.assertOwner(userId, dexId);
    await this.entryRepo
      .createQueryBuilder()
      .insert()
      .into(DexEntry)
      .values({ dexId, formId })
      .orIgnore()
      .execute();
  }

  async markUncaught(
    userId: string,
    dexId: string,
    formId: string,
  ): Promise<void> {
    await this.assertOwner(userId, dexId);
    await this.entryRepo.delete({ dexId, formId });
  }

  /** Return caught status for a batch of form IDs in one query. */
  async checkCaught(
    userId: string,
    dexId: string,
    formIds: string[],
  ): Promise<Record<string, boolean>> {
    await this.assertOwner(userId, dexId);
    if (formIds.length === 0) return {};

    const entries = await this.entryRepo.find({
      where: formIds.map((formId) => ({ dexId, formId })),
      select: ['formId'],
    });

    const caughtSet = new Set(entries.map((e) => e.formId));
    return Object.fromEntries(formIds.map((id) => [id, caughtSet.has(id)]));
  }

  // ── Helper ────────────────────────────────────────────────────────────────

  private async assertOwner(userId: string, dexId: string): Promise<Dex> {
    const dex = await this.dexRepo.findOne({ where: { id: dexId } });
    if (!dex) throw new NotFoundException(`Dex ${dexId} not found`);
    if (dex.userId !== userId) throw new ForbiddenException();
    return dex;
  }
}
