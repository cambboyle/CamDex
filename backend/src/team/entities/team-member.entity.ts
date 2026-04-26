import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Team } from './team.entity';
import { PokemonForm } from '../../pokemon/entities/pokemon-form.entity';

@Entity('team_members')
@Unique(['teamId', 'slot'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team, (t) => t.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ type: 'uuid', name: 'team_id' })
  teamId: string;

  /** 1–6 */
  @Column({ type: 'int' })
  slot: number;

  @ManyToOne(() => PokemonForm, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'form_id' })
  form: PokemonForm | null;

  @Column({ type: 'uuid', name: 'form_id', nullable: true })
  formId: string | null;

  @Column({ type: 'varchar', length: 12, nullable: true })
  nickname: string | null;

  @Column({ type: 'boolean', name: 'is_shiny', default: false })
  isShiny: boolean;

  // ── Battle customisation ────────────────────────────────────────────────

  @Column({ type: 'varchar', length: 100, name: 'held_item', nullable: true })
  heldItem: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ability: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  nature: string | null;

  @Column({ type: 'varchar', length: 100, name: 'move_1', nullable: true })
  move1: string | null;

  @Column({ type: 'varchar', length: 100, name: 'move_2', nullable: true })
  move2: string | null;

  @Column({ type: 'varchar', length: 100, name: 'move_3', nullable: true })
  move3: string | null;

  @Column({ type: 'varchar', length: 100, name: 'move_4', nullable: true })
  move4: string | null;

  // ── EVs (or SP for Champions — same columns, different cap per game) ────

  @Column({ type: 'int', name: 'ev_hp', default: 0 })
  evHp: number;

  @Column({ type: 'int', name: 'ev_atk', default: 0 })
  evAtk: number;

  @Column({ type: 'int', name: 'ev_def', default: 0 })
  evDef: number;

  @Column({ type: 'int', name: 'ev_spa', default: 0 })
  evSpa: number;

  @Column({ type: 'int', name: 'ev_spd', default: 0 })
  evSpd: number;

  @Column({ type: 'int', name: 'ev_spe', default: 0 })
  evSpe: number;

  // ── IVs (null = not tracked; Champions treats as always 31) ─────────────

  @Column({ type: 'int', name: 'iv_hp', nullable: true })
  ivHp: number | null;

  @Column({ type: 'int', name: 'iv_atk', nullable: true })
  ivAtk: number | null;

  @Column({ type: 'int', name: 'iv_def', nullable: true })
  ivDef: number | null;

  @Column({ type: 'int', name: 'iv_spa', nullable: true })
  ivSpa: number | null;

  @Column({ type: 'int', name: 'iv_spd', nullable: true })
  ivSpd: number | null;

  @Column({ type: 'int', name: 'iv_spe', nullable: true })
  ivSpe: number | null;

  // ── Game-mechanic slots ─────────────────────────────────────────────────

  /** Gen 9 Tera type / Scarlet–Violet */
  @Column({ type: 'varchar', length: 20, name: 'tera_type', nullable: true })
  teraType: string | null;

  /** Gen 6 Mega Stone OR Champions Omni Ring */
  @Column({ type: 'varchar', length: 100, name: 'mega_stone', nullable: true })
  megaStone: string | null;

  /** Gen 7 Z-Crystal */
  @Column({ type: 'varchar', length: 100, name: 'z_crystal', nullable: true })
  zCrystal: string | null;

  /** Gen 8 Dynamax level (0–10) */
  @Column({ type: 'smallint', name: 'dynamax_level', nullable: true })
  dynamaxLevel: number | null;
}
