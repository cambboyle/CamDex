import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TeamMember } from './team-member.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  /** e.g. "champions" | "scarlet-violet" | "sword-shield" | "diamond-pearl" … */
  @Column({ type: 'varchar', length: 50 })
  game: string;

  /** "singles" | "doubles" | "casual" */
  @Column({
    type: 'varchar',
    length: 20,
    name: 'battle_format',
    default: 'singles',
  })
  battleFormat: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => TeamMember, (m) => m.team, { cascade: true })
  members: TeamMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
