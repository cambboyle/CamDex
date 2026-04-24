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

  @Column({ type: 'varchar', length: 100 })
  formKey: string;

  @Column({ type: 'varchar', length: 150 })
  displayName: string;

  @Column({ type: 'boolean', default: true })
  isDefault: boolean;

  @Column({ type: 'boolean', default: false })
  isBattleOnly: boolean;

  @Column({ type: 'boolean', default: false })
  isMega: boolean;

  @Column({ type: 'boolean', default: false })
  isGmax: boolean;

  @Column({ type: 'boolean', default: false })
  isRegionalVariant: boolean;

  @Column({ type: 'varchar', length: 30, nullable: true })
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

  @Column({ type: 'text', nullable: true })
  spriteUrl: string | null;

  @Column({ type: 'text', nullable: true })
  spriteShinyUrl: string | null;

  @Column({ type: 'text', nullable: true })
  spriteFrontUrl: string | null;

  @Column({ type: 'int' })
  livingDexOrder: number;
}
