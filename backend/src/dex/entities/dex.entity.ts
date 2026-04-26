import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DexEntry } from './dex-entry.entity';

/**
 * A user-created dex tracker configuration.
 *
 * game: any game key ("champions" | "scarlet-violet" | … | "home")
 *   "home" means the full national dex — no Pokémon filter applied.
 *
 * dexType:
 *   "living-form"    — every obtainable non-battle-only form, normal
 *   "species"        — one entry per species (default form only), normal
 *   "shiny-form"     — every form, tracking shinies
 *   "shiny-species"  — one per species, tracking shinies
 */
@Entity('dexes')
export class Dex {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 60 })
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'home' })
  game: string;

  @Column({
    type: 'varchar',
    length: 30,
    name: 'dex_type',
    default: 'living-form',
  })
  dexType: string;

  @OneToMany(() => DexEntry, (e) => e.dex, { cascade: true })
  entries: DexEntry[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
