import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PokemonForm } from './pokemon-form.entity';

@Entity('pokemon_species')
export class PokemonSpecies {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  nationalDexNumber: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  displayName: string;

  @Column({ type: 'int' })
  generation: number;

  @Column({ type: 'boolean', default: false })
  isLegendary: boolean;

  @Column({ type: 'boolean', default: false })
  isMythical: boolean;

  @Column({ type: 'boolean', default: false })
  isBaby: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  color: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  shape: string | null;

  @Column({ type: 'text', nullable: true })
  flavorText: string | null;

  @Column({ type: 'timestamp', nullable: true })
  syncedAt: Date | null;

  @OneToMany(() => PokemonForm, (form) => form.species)
  forms: PokemonForm[];
}
