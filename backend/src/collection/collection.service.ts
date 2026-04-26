import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPokemon } from './entities/user-pokemon.entity';
import { PokemonForm } from '../pokemon/entities/pokemon-form.entity';
import { AddPokemonDto } from './dto/add-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

export interface LivingDexEntry {
  formId: string;
  formKey: string;
  displayName: string;
  isDefault: boolean;
  isMega: boolean;
  isGmax: boolean;
  isRegionalVariant: boolean;
  regionVariantName: string | null;
  type1: string | null;
  type2: string | null;
  spriteUrl: string | null;
  spriteShinyUrl: string | null;
  spriteFrontUrl: string | null;
  livingDexOrder: number;
  nationalDexNumber: number;
  speciesDisplayName: string;
  // catch status
  caughtId: string | null;
  caughtShinyId: string | null;
}

export interface LivingDexStats {
  totalForms: number;
  caughtForms: number;
  shinyCaught: number;
  completionPercent: number;
}

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(UserPokemon)
    private readonly userPokemonRepo: Repository<UserPokemon>,
    @InjectRepository(PokemonForm)
    private readonly formRepo: Repository<PokemonForm>,
  ) {}

  async getCollection(userId: string) {
    return this.userPokemonRepo.find({
      where: { userId },
      relations: ['species', 'form'],
      order: { caughtAt: 'DESC' },
    });
  }

  async addToCollection(
    userId: string,
    dto: AddPokemonDto,
  ): Promise<UserPokemon> {
    const form = await this.formRepo.findOne({
      where: { id: dto.formId },
      relations: ['species'],
    });
    if (!form) throw new NotFoundException(`Form ${dto.formId} not found`);

    const isShiny = dto.isShiny ?? false;

    // Check for duplicate (same user, form, shiny status)
    const existing = await this.userPokemonRepo.findOne({
      where: { userId, formId: dto.formId, isShiny },
    });
    if (existing) {
      throw new ConflictException(
        `You already have a ${isShiny ? 'shiny ' : ''}${form.displayName} in your collection`,
      );
    }

    const pokemon = this.userPokemonRepo.create({
      userId,
      speciesId: form.species.id,
      formId: dto.formId,
      nickname: dto.nickname ?? null,
      isShiny,
      ball: dto.ball ?? null,
      gender: dto.gender ?? null,
      gameOfOrigin: dto.gameOfOrigin ?? null,
      otName: dto.otName ?? null,
      level: dto.level ?? null,
      nature: dto.nature ?? null,
      notes: dto.notes ?? null,
    });

    return this.userPokemonRepo.save(pokemon);
  }

  async updatePokemon(
    userId: string,
    id: string,
    dto: UpdatePokemonDto,
  ): Promise<UserPokemon> {
    const pokemon = await this.userPokemonRepo.findOneBy({ id });
    if (!pokemon) throw new NotFoundException(`Pokémon ${id} not found`);
    if (pokemon.userId !== userId) throw new ForbiddenException();

    Object.assign(pokemon, {
      nickname: dto.nickname ?? pokemon.nickname,
      isShiny: dto.isShiny ?? pokemon.isShiny,
      ball: dto.ball ?? pokemon.ball,
      gender: dto.gender ?? pokemon.gender,
      gameOfOrigin: dto.gameOfOrigin ?? pokemon.gameOfOrigin,
      otName: dto.otName ?? pokemon.otName,
      level: dto.level ?? pokemon.level,
      notes: dto.notes ?? pokemon.notes,
    });

    return this.userPokemonRepo.save(pokemon);
  }

  async removePokemon(userId: string, id: string): Promise<void> {
    const pokemon = await this.userPokemonRepo.findOneBy({ id });
    if (!pokemon) throw new NotFoundException(`Pokémon ${id} not found`);
    if (pokemon.userId !== userId) throw new ForbiddenException();
    await this.userPokemonRepo.remove(pokemon);
  }

  async getLivingDex(
    userId: string,
  ): Promise<{ entries: LivingDexEntry[]; stats: LivingDexStats }> {
    // Single query: all forms LEFT JOIN user catches for this user
    const rows = await this.formRepo
      .createQueryBuilder('f')
      .innerJoin('f.species', 's')
      .leftJoin(
        'user_pokemon',
        'up_reg',
        'up_reg.form_id = f.id AND up_reg.user_id = :userId AND up_reg.is_shiny = false',
        { userId },
      )
      .leftJoin(
        'user_pokemon',
        'up_shiny',
        'up_shiny.form_id = f.id AND up_shiny.user_id = :userId AND up_shiny.is_shiny = true',
        { userId },
      )
      .where('f.is_battle_only = false')
      .select([
        'f.id AS "formId"',
        'f.form_key AS "formKey"',
        'f.display_name AS "displayName"',
        'f.is_default AS "isDefault"',
        'f.is_mega AS "isMega"',
        'f.is_gmax AS "isGmax"',
        'f.is_regional_variant AS "isRegionalVariant"',
        'f.region_variant_name AS "regionVariantName"',
        'f.type1 AS "type1"',
        'f.type2 AS "type2"',
        'f.sprite_url AS "spriteUrl"',
        'f.sprite_shiny_url AS "spriteShinyUrl"',
        'f.sprite_front_url AS "spriteFrontUrl"',
        'f.living_dex_order AS "livingDexOrder"',
        's.national_dex_number AS "nationalDexNumber"',
        's.display_name AS "speciesDisplayName"',
        'up_reg.id AS "caughtId"',
        'up_shiny.id AS "caughtShinyId"',
      ])
      .orderBy('f.living_dex_order', 'ASC')
      .getRawMany<LivingDexEntry>();

    const totalForms = rows.length;
    const caughtForms = rows.filter((r) => r.caughtId !== null).length;
    const shinyCaught = rows.filter((r) => r.caughtShinyId !== null).length;
    const completionPercent =
      totalForms > 0 ? Math.round((caughtForms / totalForms) * 100) : 0;

    return {
      entries: rows,
      stats: { totalForms, caughtForms, shinyCaught, completionPercent },
    };
  }
}
