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
  'firered-leafgreen': { maxGen: 1 },
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
      dexType: dto.dexType ?? 'living-form',
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
    const speciesOnly =
      dex.dexType === 'species' || dex.dexType === 'shiny-species';

    // Base conditions shared by both queries (no $N placeholders)
    const baseConditions: string[] = ['f.is_battle_only = FALSE'];
    if (speciesOnly) baseConditions.push('f.is_default = TRUE');

    // Champions filter has no parameters; maxGen needs one.
    // Build separate param arrays + WHERE strings so each query gets
    // its own correctly-indexed $1, $2, … placeholders.
    const champCondition = `(s.is_legendary = false AND s.is_mythical = false)`;

    // ── Count query (no dexId param) ──────────────────────────────────────
    const countConditions = [...baseConditions];
    const countParams: unknown[] = [];
    if (filter.championsOnly) {
      countConditions.push(champCondition);
    } else if (filter.maxGen) {
      countParams.push(filter.maxGen);
      countConditions.push(`s.generation <= $${countParams.length}`); // $1
    }
    const countWhere = countConditions.join(' AND ');

    // ── Data query ($1 = dexId, then game param, then limit/offset) ───────
    const dataConditions = [...baseConditions];
    const dataParams: unknown[] = [dexId]; // $1 = dexId (for LEFT JOIN)
    if (filter.championsOnly) {
      dataConditions.push(champCondition);
    } else if (filter.maxGen) {
      dataParams.push(filter.maxGen);
      dataConditions.push(`s.generation <= $${dataParams.length}`); // $2
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
      dex: { id: dex.id, name: dex.name, game: dex.game, dexType: dex.dexType },
      entries: rows,
      page: p,
      total,
      totalPages: Math.ceil(total / BOX_SIZE),
    };
  }

  async getAll(userId: string, dexId: string) {
    const dex = await this.assertOwner(userId, dexId);

    const filter = GAME_FILTERS[dex.game] ?? {};
    const speciesOnly =
      dex.dexType === 'species' || dex.dexType === 'shiny-species';

    const baseConditions: string[] = ['f.is_battle_only = FALSE'];
    if (speciesOnly) baseConditions.push('f.is_default = TRUE');

    const champCondition = `(s.is_legendary = false AND s.is_mythical = false)`;

    const conditions = [...baseConditions];
    const params: unknown[] = [dexId]; // $1 = dexId (for LEFT JOIN)

    if (filter.championsOnly) {
      conditions.push(champCondition);
    } else if (filter.maxGen) {
      params.push(filter.maxGen);
      conditions.push(`s.generation <= $${params.length}`); // $2
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
      dex: { id: dex.id, name: dex.name, game: dex.game, dexType: dex.dexType },
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
    const speciesOnly =
      dex.dexType === 'species' || dex.dexType === 'shiny-species';

    const conditions: string[] = ['f.is_battle_only = FALSE'];
    const params: unknown[] = [];
    let idx = 1;

    if (speciesOnly) conditions.push('f.is_default = TRUE');

    if (filter.championsOnly) {
      conditions.push(
        `(s.is_legendary = false AND s.is_mythical = false)`,
      );
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

  // ── Helper ────────────────────────────────────────────────────────────────

  private async assertOwner(userId: string, dexId: string): Promise<Dex> {
    const dex = await this.dexRepo.findOne({ where: { id: dexId } });
    if (!dex) throw new NotFoundException(`Dex ${dexId} not found`);
    if (dex.userId !== userId) throw new ForbiddenException();
    return dex;
  }
}
