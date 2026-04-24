import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { PokemonSpecies } from '../../pokemon/entities/pokemon-species.entity';
import { PokemonForm } from '../../pokemon/entities/pokemon-form.entity';

@Entity('user_pokemon')
@Unique(['userId', 'formId', 'isShiny'])
export class UserPokemon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => PokemonSpecies, { eager: false })
  @JoinColumn({ name: 'species_id' })
  species: PokemonSpecies;

  @Column({ type: 'uuid', name: 'species_id' })
  speciesId: string;

  @ManyToOne(() => PokemonForm, { eager: false })
  @JoinColumn({ name: 'form_id' })
  form: PokemonForm;

  @Column({ type: 'uuid', name: 'form_id' })
  formId: string;

  @Column({ type: 'varchar', length: 12, nullable: true })
  nickname: string | null;

  @Column({ type: 'boolean', default: false, name: 'is_shiny' })
  isShiny: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ball: string | null;

  @Column({ type: 'varchar', length: 1, nullable: true })
  gender: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'game_of_origin' })
  gameOfOrigin: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true, name: 'ot_name' })
  otName: string | null;

  @Column({ type: 'int', nullable: true })
  level: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  nature: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'caught_at' })
  caughtAt: Date;
}
