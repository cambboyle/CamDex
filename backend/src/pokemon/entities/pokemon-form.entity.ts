import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { PokemonSpecies } from './pokemon-species.entity';

@Entity('pokemon_forms')
@Unique(['species', 'formKey'])
export class PokemonForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PokemonSpecies, (species) => species.forms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'species_id' })
  species: PokemonSpecies;

  @Column({ type: 'varchar', length: 100, name: 'form_key' })
  formKey: string;

  @Column({ type: 'varchar', length: 150, name: 'display_name' })
  displayName: string;

  @Column({ type: 'boolean', default: true, name: 'is_default' })
  isDefault: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_battle_only' })
  isBattleOnly: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_mega' })
  isMega: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_gmax' })
  isGmax: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_regional_variant' })
  isRegionalVariant: boolean;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
    name: 'region_variant_name',
  })
  regionVariantName: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  type1: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  type2: string | null;

  @Column({ type: 'int', nullable: true })
  hp: number | null;

  @Column({ type: 'int', nullable: true })
  atk: number | null;

  @Column({ type: 'int', nullable: true })
  def: number | null;

  @Column({ type: 'int', nullable: true })
  spa: number | null;

  @Column({ type: 'int', nullable: true })
  spd: number | null;

  @Column({ type: 'int', nullable: true })
  spe: number | null;

  @Column({ type: 'text', nullable: true, name: 'sprite_url' })
  spriteUrl: string | null;

  @Column({ type: 'text', nullable: true, name: 'sprite_shiny_url' })
  spriteShinyUrl: string | null;

  @Column({ type: 'text', nullable: true, name: 'sprite_front_url' })
  spriteFrontUrl: string | null;

  @Column({ type: 'int', name: 'living_dex_order' })
  livingDexOrder: number;

  /**
   * True for forms that are purely visual — same typing and base stats as the
   * species' default form, but a different appearance (Unown letters, Vivillon
   * wing patterns, Alcremie cream colours, Furfrou trims, etc.).
   * Set automatically by the RefactorDexOptions migration.
   */
  @Column({ type: 'boolean', name: 'is_cosmetic_only', default: false })
  isCosmeticOnly: boolean;
}
