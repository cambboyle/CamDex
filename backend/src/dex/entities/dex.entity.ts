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
 * game            — any game key ("home" | "champions" | "scarlet-violet" | …)
 * isShiny         — track shiny sprites instead of normal
 * includeForms    — track alternate/regional/mega forms (not just default forms)
 * includeCosmeticForms — also track purely visual variants (Unown letters,
 *                        Vivillon patterns, Alcremie cream colours, etc.)
 *                        Only meaningful when includeForms is true.
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

  @Column({ type: 'boolean', name: 'is_shiny', default: false })
  isShiny: boolean;

  @Column({ type: 'boolean', name: 'include_forms', default: false })
  includeForms: boolean;

  @Column({ type: 'boolean', name: 'include_cosmetic_forms', default: false })
  includeCosmeticForms: boolean;

  @OneToMany(() => DexEntry, (e) => e.dex, { cascade: true })
  entries: DexEntry[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
