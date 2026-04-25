import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PokemonForm } from './pokemon-form.entity';

@Entity('pokemon_species')
export class PokemonSpecies {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true, name: 'national_dex_number' })
  nationalDexNumber: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, name: 'display_name' })
  displayName: string;

  @Column({ type: 'int' })
  generation: number;

  @Column({ type: 'boolean', default: false, name: 'is_legendary' })
  isLegendary: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_mythical' })
  isMythical: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_baby' })
  isBaby: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  color: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  shape: string | null;

  @Column({ type: 'text', nullable: true, name: 'flavor_text' })
  flavorText: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'flavor_texts' })
  flavorTexts: { text: string; version: string }[] | null;

  @Column({ type: 'timestamp', nullable: true, name: 'synced_at' })
  syncedAt: Date | null;

  @OneToMany(() => PokemonForm, (form) => form.species)
  forms: PokemonForm[];
}
