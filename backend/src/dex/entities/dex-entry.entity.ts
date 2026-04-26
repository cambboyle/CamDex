import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Dex } from './dex.entity';

@Entity('dex_entries')
@Unique(['dexId', 'formId'])
export class DexEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Dex, (d) => d.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dex_id' })
  dex: Dex;

  @Column({ type: 'uuid', name: 'dex_id' })
  dexId: string;

  @Column({ type: 'uuid', name: 'form_id' })
  formId: string;

  @CreateDateColumn({ name: 'caught_at' })
  caughtAt: Date;
}
